import Fastify from 'fastify';
import cors from '@fastify/cors';
import { initSocket, getIO } from '../src/socket';
import { categoriesRoutes } from '../src/routes/categories';
import { providersRoutes } from '../src/routes/providers';
import { jobsRoutes } from '../src/routes/jobs';
import { bidsRoutes } from '../src/routes/bids';
import prisma from '../lib/prisma';

let app: ReturnType<typeof Fastify>;
let categoryId: number;
let provider1: { id: number };
let provider2: { id: number };
let job: { id: number };

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
    app.register(bidsRoutes);

    await app.listen({ port: 0 });
    initSocket(app.server);

    const cat = await prisma.category.create({ data: { name: 'TestCat' } });
    categoryId = cat.id;

    provider1 = await prisma.provider.create({
        data: { name: 'Prov1', lat: 1.3, lon: 103.8 }
    });
    provider2 = await prisma.provider.create({
        data: { name: 'Prov2', lat: 1.4, lon: 103.9 }
    });

    job = await prisma.job.create({
        data: {
            categoryId,
            price: 100,
            timeslot: '2h',
            customerLat: 1.35,
            customerLon: 103.85
        }
    });
});

afterAll(async () => {
    await prisma.escrow.deleteMany();
    await prisma.bid.deleteMany();
    await prisma.job.deleteMany();
    await prisma.provider.deleteMany();
    await prisma.category.deleteMany();

    await app.close();
    getIO().close?.();
    await prisma.$disconnect();
});

describe('Bid Endpoints Full Flow', () => {
    it('GET /jobs/:id/bids initially empty', async () => {
        const res = await app.inject({
            method: 'GET',
            url: `/jobs/${job.id}/bids`,
        });
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.payload)).toEqual([]);
    });

    let bid1: any, bid2: any;

    it('POST /jobs/:id/bids provider1 success', async () => {
        const res = await app.inject({
            method: 'POST',
            url: `/jobs/${job.id}/bids`,
            payload: { providerId: provider1.id, price: 90, note: 'note1' }
        });
        expect(res.statusCode).toBe(201);
        bid1 = JSON.parse(res.payload);
        expect(bid1).toMatchObject({
            jobId: job.id,
            providerId: provider1.id,
            price: 90,
            note: 'note1'
        });
    });

    it('POST same bid again returns 409', async () => {
        const res = await app.inject({
            method: 'POST',
            url: `/jobs/${job.id}/bids`,
            payload: { providerId: provider1.id, price: 95 }
        });
        expect(res.statusCode).toBe(409);
    });

    it('POST /jobs/:id/bids provider2 success', async () => {
        const res = await app.inject({
            method: 'POST',
            url: `/jobs/${job.id}/bids`,
            payload: { providerId: provider2.id, price: 95, note: 'note2' }
        });
        expect(res.statusCode).toBe(201);
        bid2 = JSON.parse(res.payload);
        expect(bid2.providerId).toBe(provider2.id);
    });

    it('GET /jobs/:id/bids returns two bids', async () => {
        const res = await app.inject({
            method: 'GET',
            url: `/jobs/${job.id}/bids`
        });
        expect(res.statusCode).toBe(200);
        const arr = JSON.parse(res.payload);
        expect(Array.isArray(arr)).toBe(true);
        expect(arr).toHaveLength(2);
    });

    it('GET /jobs/:id/top-bids returns up to 2 bids sorted', async () => {
        const res = await app.inject({
            method: 'GET',
            url: `/jobs/${job.id}/top-bids`
        });
        expect(res.statusCode).toBe(200);
        const arr = JSON.parse(res.payload);
        expect(arr.length).toBeLessThanOrEqual(2);
        if (arr.length === 2) {
            expect(arr[0].score).toBeLessThanOrEqual(arr[1].score);
        }
    });

    it('POST /jobs/:id/bids/:bidId/select picks bid1', async () => {
        const res = await app.inject({
            method: 'POST',
            url: `/jobs/${job.id}/bids/${bid1.id}/select`
        });
        expect(res.statusCode).toBe(200);
        const jobBody = JSON.parse(res.payload);
        expect(jobBody.status).toBe('BOOKED');
        expect(jobBody.acceptedById).toBe(provider1.id);
    });

    it('POST select again returns 409', async () => {
        const res = await app.inject({
            method: 'POST',
            url: `/jobs/${job.id}/bids/${bid2.id}/select`
        });
        expect(res.statusCode).toBe(409);
        expect(JSON.parse(res.payload)).toEqual({ error: 'Job already taken' });
    });
});
