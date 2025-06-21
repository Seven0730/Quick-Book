import Fastify from 'fastify';
import cors from '@fastify/cors';
import { categoriesRoutes } from './routes/categories';
import { jobsRoutes } from './routes/jobs';
import { escrowRoutes } from './routes/escrow';

async function start() {

    const app = Fastify({ logger: true });
    await app.register(cors, { origin: '*' });

    app.register(categoriesRoutes, { prefix: '/categories' });
    app.register(jobsRoutes, { prefix: '/jobs' });
    app.register(escrowRoutes, { prefix: '/escrow' });

    const port = 4000;
    await app.listen({ port });
    console.log(`🚀 Server running at http://localhost:${port}`);
}

start().catch(err => {
    console.error(err);
    process.exit(1);
});
