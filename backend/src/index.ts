import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Server as IOServer } from 'socket.io';
import { categoriesRoutes } from './routes/categories';
import { jobsRoutes } from './routes/jobs';
import { escrowRoutes } from './routes/escrow';

async function start() {

    const app = Fastify({ logger: true });
    await app.register(cors, { origin: '*' });

    app.register(categoriesRoutes, { prefix: '/categories' });
    app.register(jobsRoutes, { prefix: '/jobs' });
    app.register(escrowRoutes, { prefix: '/escrow' });

    await app.listen({ port: 4000 });
    const server = app.server;
    app.log.info('HTTP server running on http://localhost:4000');

    const io = new IOServer(server, { cors: { origin: '*' } });
    app.decorate('io', io);

    io.on('connection', (socket) => {
        app.log.info(`Client connected: ${socket.id}`);
        socket.on('disconnect', () => {
            app.log.info(`Client disconnected: ${socket.id}`);
        });
    });

}

start().catch(err => {
    console.error(err);
    process.exit(1);
});
