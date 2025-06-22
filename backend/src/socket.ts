import { Server as IOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';

let io: IOServer;

export function initSocket(server: HTTPServer) {
  io = new IOServer(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
}

export function getIO(): IOServer {
  if (!io) {
    throw new Error('Socket.IO not initialized. Did you call initSocket()?');
  }
  return io;
}
