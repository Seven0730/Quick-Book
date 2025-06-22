import Fastify from 'fastify';
import cors from '@fastify/cors';
import { categoriesRoutes } from './routes/categories';
import { jobsRoutes } from './routes/jobs';
import { escrowRoutes } from './routes/escrow';
import { providersRoutes } from './routes/providers';
import { initSocket } from './socket';

async function start() {

    const app = Fastify({ logger: true });
    await app.register(cors, { origin: '*' });

    app.register(categoriesRoutes, { prefix: '/categories' });
    app.register(jobsRoutes, { prefix: '/jobs' });
    app.register(escrowRoutes, { prefix: '/escrow' });
    app.register(providersRoutes, { prefix: '/providers' });

    await app.listen({ port: 4000 });
    app.log.info('HTTP server listening on http://localhost:4000');

    initSocket(app.server);

}

start().catch(err => {
    console.error(err);
    process.exit(1);
});
