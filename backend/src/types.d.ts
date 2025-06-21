import type { Server as IOServer } from 'socket.io';
import 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    io: IOServer;
  }
}
