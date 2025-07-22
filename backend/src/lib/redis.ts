import { createClient } from 'redis';

// Create Redis client instance
export const redis = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.on('error', (err) => console.error('Redis Client Error', err));

// Initialize Redis connection
export async function initRedis() {
    if (!redis.isOpen) {
        await redis.connect();
        console.log('Redis connected successfully');
    }
}

// Distributed lock utility for preventing race conditions in job acceptance
export class DistributedLock {
    /**
     * Acquire a distributed lock with automatic expiration
     * @param key - Lock key identifier
     * @param ttl - Time to live in milliseconds (default: 10 seconds)
     * @returns Lock value if successful, null if failed
     */
    static async acquire(key: string, ttl: number = 10000): Promise<string | null> {
        const lockKey = `lock:${key}`;
        const lockValue = `${Date.now()}-${Math.random().toString(36)}`;
        
        try {
            const result = await redis.set(lockKey, lockValue, {
                PX: ttl, // Expiration time in milliseconds
                NX: true // Only set if key does not exist
            });
            
            return result === 'OK' ? lockValue : null;
        } catch (error) {
            console.error('Failed to acquire lock:', error);
            return null;
        }
    }
    
    /**
     * Release a distributed lock using Lua script for atomicity
     * @param key - Lock key identifier
     * @param lockValue - The value returned from acquire()
     * @returns true if successfully released, false otherwise
     */
    static async release(key: string, lockValue: string): Promise<boolean> {
        const lockKey = `lock:${key}`;
        
        // Lua script ensures atomic check-and-delete operation
        const script = `
            if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("del", KEYS[1])
            else
                return 0
            end
        `;
        
        try {
            const result = await redis.eval(script, {
                keys: [lockKey],
                arguments: [lockValue]
            });
            
            return result === 1;
        } catch (error) {
            console.error('Failed to release lock:', error);
            return false;
        }
    }
    
    /**
     * Execute a function with distributed lock protection
     * @param key - Lock key identifier
     * @param fn - Function to execute while holding the lock
     * @param ttl - Lock timeout in milliseconds
     * @returns Promise resolving to the function result
     */
    static async withLock<T>(
        key: string, 
        fn: () => Promise<T>, 
        ttl: number = 10000
    ): Promise<T> {
        const lockValue = await this.acquire(key, ttl);
        
        if (!lockValue) {
            throw new Error(`Failed to acquire lock for key: ${key}`);
        }
        
        try {
            return await fn();
        } finally {
            await this.release(key, lockValue);
        }
    }
} 