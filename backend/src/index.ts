import Fastify from 'fastify';
import cors from '@fastify/cors';
import { categoriesRoutes } from './routes/categories';
import { jobsRoutes } from './routes/jobs';

async function start() {
    const app = Fastify();

    await app.register(cors, { origin: '*' });

    app.register(categoriesRoutes, { prefix: '/categories' });
    app.register(jobsRoutes, { prefix: '/jobs' });

    const port = 4000;
    await app.listen({ port });
    console.log(`🚀 Server running at http://localhost:${port}`);
}

start().catch(err => {
    console.error(err);
    process.exit(1);
});
