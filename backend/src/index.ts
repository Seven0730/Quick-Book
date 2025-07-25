import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit'
import { categoriesRoutes } from './routes/categories';
import { jobsRoutes } from './routes/jobs';
import { escrowRoutes } from './routes/escrow';
import { providersRoutes } from './routes/providers';
import { bidsRoutes } from './routes/bids';
import { initSocket } from './socket';
import { initRedis } from './lib/redis';

async function start() {

    const app = Fastify({ logger: true });
    await app.register(cors, { origin: '*' });

    // Initialize Redis connection
    await initRedis();

    await app.register(rateLimit, {
        max: 1000,
        timeWindow: '1 minute',
        errorResponseBuilder: (_req, context) => ({
            statusCode: 429,
            error: 'Too Many Requests',
            message: `You can only make ${context.max} requests in ${context.after}`,
        })
    }), {
        prefix: '/jobs',
        methods: ['POST', 'PUT', 'DELETE']
    }

    await app.register(import('@fastify/swagger'))

    await app.register(import('@fastify/swagger-ui'), {
        routePrefix: '/documentation',
        uiConfig: {
            docExpansion: 'full',
            deepLinking: false
        },
        uiHooks: {
            onRequest: function (request, reply, next) { next() },
            preHandler: function (request, reply, next) { next() }
        },
        staticCSP: true,
        transformStaticCSP: (header) => header,
        transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
        transformSpecificationClone: true
    })

    app.register(categoriesRoutes, { prefix: '/categories' });
    app.register(jobsRoutes, { prefix: '/jobs' });
    app.register(escrowRoutes, { prefix: '/escrow' });
    app.register(providersRoutes, { prefix: '/providers' });
    app.register(bidsRoutes);

    await app.listen({
        port: 4000,
        host: '0.0.0.0'
    })
    app.log.info('HTTP server listening on http://0.0.0.0:4000')

    initSocket(app.server);

}

start().catch(err => {
    console.error(err);
    process.exit(1);
});
