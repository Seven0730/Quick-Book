'use client';
import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useProviderContext } from '@/contexts/ProviderContext';

let socket: Socket | null = null;

export function useSocket() {
    const { providerId } = useProviderContext();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // only init once we have a providerId
        if (!socket && providerId != null) {
            socket = io(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000', {
                query: { providerId }    // <-- send it here
            });
            (window as any).socket = socket;
            socket.on('connect', () => {
                console.log('🔗 socket connected, id=', socket!.id);
                setReady(true);
                socket!.on('new-job', (job: any) => {
                    console.log('📬 new-job event payload:', job);
                });
                socket!.emit('identify', {
                    providerId,
                    lat: Number(localStorage.getItem('provLat')) || 0,
                    lon: Number(localStorage.getItem('provLon')) || 0,
                });
            });
        }
        return () => {
            // optionally tear down if providerId changes
            // socket?.disconnect();
            // socket = null;
        };
    }, [providerId]);

    return { socket, ready };
}
