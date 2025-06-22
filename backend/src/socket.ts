import { Server as IOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';

interface ProviderInfo {
  socketId: string;
  lat: number;
  lon: number;
}

// map providerId → ProviderInfo
export const providerSockets = new Map<number, ProviderInfo>();

let io: IOServer;

export function initSocket(server: HTTPServer) {
  io = new IOServer(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('identify', (payload: { providerId: number; lat: number; lon: number }) => {
      const { providerId, lat, lon } = payload;
      providerSockets.set(providerId, { socketId: socket.id, lat, lon });
      console.log(`Provider ${providerId} registered on socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      // remove the socket from the map
      for (const [pid, info] of providerSockets) {
        if (info.socketId === socket.id) {
          providerSockets.delete(pid);
          console.log(`Provider ${pid} disconnected`);
          break;
        }
      }
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

export function getIO(): IOServer {
  if (!io) throw new Error('Socket.IO not initialized. Did you call initSocket()?');
  return io;
}
