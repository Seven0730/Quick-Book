'use client';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useSocket() {
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!socket) {
            socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
            socket.on('connect', () => setConnected(true));
            socket.on('disconnect', () => setConnected(false));
        }
        return () => {
            // optionally tear down on unmount:
            // socket?.off(); socket = null;
        };
    }, []);

    return { socket, connected };
}
