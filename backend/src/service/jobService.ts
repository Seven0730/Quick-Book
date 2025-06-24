import { jobRepository } from '../repository/jobRepository';
import { escrowRepository } from '../repository/escrowRepository';
import { bidRepository } from '../repository/bidRepository';
import { escrowService } from './escrowService';
import { providerService } from './providerService';
import { getIO, providerSockets } from '../socket';
import { haversine } from '../utils/haversine';
import { Job } from '@prisma/client';
import { PriceGuidance } from '../schemas/PriceGuidance';

const STAGE1_RADIUS_KM = 3;
const STAGE2_RADIUS_KM = 10;
const STAGE1_DELAY_MS = 0;
const STAGE2_DELAY_MS = 5 * 60 * 1000;  // 5 minutes
const STAGE3_DELAY_MS = 15 * 60 * 1000; // 15 minutes

const isTest = process.env.NODE_ENV === 'test';

function isTierA(p: { rating: number; completed: number }) {
    return p.rating >= 4.5 && p.completed >= 50;
}

async function broadcastStage(job: Job, stage: 1 | 2 | 3) {
    const io = getIO();
    const providers = await providerService.list();

    for (const p of providers) {
        const info = providerSockets.get(p.id);
        if (!info) continue;

        const distance = haversine(
            job.customerLat,
            job.customerLon,
            p.lat,
            p.lon
        );

        let shouldNotify = false;
        if (stage === 1) {
            // Tier-A
            shouldNotify = isTierA(p) && distance <= STAGE1_RADIUS_KM;
        } else if (stage === 2) {
            // Tier-B
            shouldNotify = !isTierA(p) && distance <= STAGE2_RADIUS_KM;
        } else {
            // Stage 3
            shouldNotify = true;
        }

        if (shouldNotify) {
            io.to(info.socketId).emit('new-job', job);
        }
    }
}

function percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const idx = p * (sorted.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    const weight = idx - lo;
    return sorted[lo] + (sorted[hi] - sorted[lo]) * weight;
}

export const jobService = {
    list: () => jobRepository.findAll(),
    get: (id: number) => jobRepository.findById(id),
    create: async (payload: {
        categoryId: number;
        price: number;
        timeslot: string;
        customerLat: number;
        customerLon: number;
    }): Promise<Job> => {
        const job = await jobRepository.create(payload);

        await escrowService.hold(job.id, job.price);

        // broadcast in 3 stages
        // Stage 1
        if (!isTest) {
            setTimeout(async () => {
                const fresh = await jobRepository.findById(job.id);
                if (fresh?.status === 'PENDING') {
                    await broadcastStage(fresh, 1);
                }
            }, STAGE1_DELAY_MS);

            // Stage 2
            setTimeout(async () => {
                const fresh = await jobRepository.findById(job.id);
                if (fresh?.status === 'PENDING') {
                    await broadcastStage(fresh, 2);
                }
            }, STAGE2_DELAY_MS);

            // Stage 3
            setTimeout(async () => {
                const fresh = await jobRepository.findById(job.id);
                if (fresh?.status === 'PENDING') {
                    await broadcastStage(fresh, 3);
                }
            }, STAGE3_DELAY_MS);
        }
        return job;
    },
    update: (id: number, data: { price?: number; timeslot?: string; status?: string }) => jobRepository.update(id, data),

    delete: async (id: number): Promise<void> => {
        await escrowRepository.deleteByJobId(id);
        await bidRepository.deleteByJobId(id);
        await jobRepository.delete(id);
    },

    async accept(id: number, providerId: number): Promise<Job> {
        const ok = await jobRepository.accept(id, providerId);
        if (!ok) throw new Error('Job already taken');
        const job = await jobRepository.findById(id);
        if (!job) throw new Error('Job not found');
        if (!isTest) {
            await escrowService.hold(job.id, job.price);
        }
        return job;
    },

    async cancelByProvider(id: number, providerId: number): Promise<Job> {
        const ok = await jobRepository.cancelByProvider(id, providerId);
        if (!ok) throw new Error('Cannot cancel job');
        await escrowService.release(id);
        // Decrement the completed count for the provider
        await providerService.decrementCompleted(providerId);
        const job = await jobRepository.findById(id);
        if (!job) throw new Error('Job not found after cancel');
        return job;
    },

    priceGuidance: async (categoryId: number): Promise<PriceGuidance> => {
        const prices = await jobRepository.findCompletedPricesByCategory(categoryId);
        const sorted = prices.sort((a, b) => a - b);
        return {
            p10: percentile(sorted, 0.10),
            p50: percentile(sorted, 0.50),
            p90: percentile(sorted, 0.90),
        };
    },
};