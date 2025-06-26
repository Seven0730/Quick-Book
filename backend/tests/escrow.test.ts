import Fastify from 'fastify';
import cors from '@fastify/cors';
import { initSocket } from '../src/socket';
import { categoriesRoutes } from '../src/routes/categories';
import { providersRoutes } from '../src/routes/providers';
import { jobsRoutes } from '../src/routes/jobs';
import { escrowRoutes } from '../src/routes/escrow';
import prisma from '../src/lib/prisma';

let app: ReturnType<typeof Fastify>;
let jobId: number;

beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await prisma.escrow.deleteMany();
    await prisma.bid.deleteMany();
    await prisma.job.deleteMany();
    await prisma.provider.deleteMany();
    await prisma.category.deleteMany();

    app = Fastify();
    await app.register(cors, { origin: '*' });
    app.register(categoriesRoutes, { prefix: '/categories' });
    app.register(providersRoutes, { prefix: '/providers' });
    app.register(jobsRoutes, { prefix: '/jobs' });
    app.register(escrowRoutes, { prefix: '/escrow' });
    await app.listen({ port: 0 });
    initSocket(app.server);

    const cat = await prisma.category.create({ data: { name: 'C' } });
    const prov = await prisma.provider.create({
        data: { name: 'P', lat: 1.3, lon: 103.8 }
    });
    const job = await prisma.job.create({
        data: {
            categoryId: cat.id,
            price: 123,
            timeslot: '1h',
            customerLat: 1.3,
            customerLon: 103.8
        }
    });
    jobId = job.id;
});

afterAll(async () => {
    await prisma.escrow.deleteMany();
    await prisma.bid.deleteMany();
    await prisma.job.deleteMany();
    await prisma.provider.deleteMany();
    await prisma.category.deleteMany();

    await app.close();
    await prisma.$disconnect();
});

describe('Escrow Endpoints', () => {
    let holdRec: any;

    it('POST /escrow/hold should create an escrow record', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/escrow/hold',
            payload: { jobId, amount: 123 }
        });
        expect(res.statusCode).toBe(201);
        holdRec = JSON.parse(res.payload);
        expect(holdRec).toMatchObject({
            jobId,
            amount: 123,
            status: 'HOLD'
        });
        expect(typeof holdRec.id).toBe('number');
    });

    it('POST /escrow/release should update status to RELEASED', async () => {
        expect(holdRec).toBeDefined();
        const res = await app.inject({
            method: 'POST',
            url: '/escrow/release',
            payload: { jobId }
        });
        expect(res.statusCode).toBe(200);
        const rel = JSON.parse(res.payload);
        expect(rel.id).toBe(holdRec.id);
        expect(rel.status).toBe('RELEASED');
    });
});
