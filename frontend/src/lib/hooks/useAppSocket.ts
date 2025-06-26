'use client';
import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

let appSocket: Socket | null = null;

export function useAppSocket() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!appSocket) {
            const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            console.log('[useAppSocket] connecting to', BACKEND);
            appSocket = io(BACKEND, {
                path: '/socket.io',
                transports: ['websocket'],
            });

            appSocket.on('connect', () => {
                console.log('[useAppSocket] connected, id=', appSocket!.id);
                setReady(true);
            });
            appSocket.on('disconnect', (reason) => {
                console.log('[useAppSocket] disconnected:', reason);
                setReady(false);
            });
        }
        setSocket(appSocket);
        return () => {
        };
    }, []);

    return { socket, ready };
}
