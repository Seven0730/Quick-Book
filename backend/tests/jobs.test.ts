// tests/jobs.full.test.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { initSocket, getIO } from '../src/socket';
import { categoriesRoutes } from '../src/routes/categories';
import { providersRoutes } from '../src/routes/providers';
import { jobsRoutes } from '../src/routes/jobs';
import prisma from '../src/lib/prisma';

let app: ReturnType<typeof Fastify>;
let categoryId: number;
let providerId: number;
let job: any;

beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    await prisma.escrow.deleteMany();
    await prisma.bid.deleteMany();
    await prisma.job.deleteMany();
    await prisma.provider.deleteMany();
    await prisma.category.deleteMany();

    const cat = await prisma.category.create({ data: { name: 'TestCat' } });
    categoryId = cat.id;
    const prov = await prisma.provider.create({
        data: { name: 'TestProv', lat: 1.30, lon: 103.80 }
    });
    providerId = prov.id;

    app = Fastify({ logger: false });
    await app.register(cors, { origin: '*' });
    app.register(categoriesRoutes, { prefix: '/categories' });
    app.register(providersRoutes, { prefix: '/providers' });
    app.register(jobsRoutes, { prefix: '/jobs' });
    await app.listen({ port: 0 });
    initSocket(app.server);
});

afterAll(async () => {
    await prisma.escrow.deleteMany();
    await prisma.bid.deleteMany();
    await prisma.job.deleteMany();
    await prisma.provider.deleteMany();
    await prisma.category.deleteMany();

    await app.close();
    getIO().close();
    await prisma.$disconnect();
});

describe('Job Endpoints Full Flow', () => {
    it('GET  /jobs → empty array', async () => {
        const res = await app.inject({ method: 'GET', url: '/jobs' });
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.payload)).toEqual([]);
    });

    it('POST /jobs → create job', async () => {
        const payload = {
            categoryId,
            price: 150,
            timeslot: '2h',
            customerLat: 1.35,
            customerLon: 103.82
        };
        const res = await app.inject({
            method: 'POST',
            url: '/jobs',
            payload
        });
        expect(res.statusCode).toBe(201);
        job = JSON.parse(res.payload);
        expect(job).toMatchObject({
            categoryId,
            price: 150,
            timeslot: '2h',
            customerLat: 1.35,
            customerLon: 103.82,
            status: 'PENDING',
            acceptPrice: null,
            acceptedById: null
        });
        expect(typeof job.id).toBe('number');
    });

    it('GET  /jobs → contains created job', async () => {
        const res = await app.inject({ method: 'GET', url: '/jobs' });
        expect(res.statusCode).toBe(200);
        const arr = JSON.parse(res.payload);
        expect(Array.isArray(arr)).toBe(true);
        expect(arr.find((j: any) => j.id === job.id)).toBeDefined();
    });

    it('GET  /jobs/:id → job details', async () => {
        const res = await app.inject({
            method: 'GET',
            url: `/jobs/${job.id}`
        });
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.payload)).toMatchObject({
            id: job.id,
            categoryId,
            price: 150,
            timeslot: '2h'
        });
    });

    it('PUT  /jobs/:id → update job', async () => {
        const res = await app.inject({
            method: 'PUT',
            url: `/jobs/${job.id}`,
            payload: { price: 200, timeslot: '3h' }
        });
        expect(res.statusCode).toBe(200);
        const updated = JSON.parse(res.payload);
        expect(updated).toMatchObject({
            id: job.id,
            price: 200,
            timeslot: '3h'
        });
        const db = await prisma.job.findUnique({ where: { id: job.id } });
        expect(db?.price).toBe(200);
        expect(db?.timeslot).toBe('3h');
    });

    it('POST /jobs/:id/accept → missing header → 400', async () => {
        const res = await app.inject({
            method: 'POST',
            url: `/jobs/${job.id}/accept`
        });
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.payload)).toEqual({
            error: 'Missing or invalid x-provider-id header'
        });
    });

    it('POST /jobs/:id/accept → success → 200', async () => {
        const res = await app.inject({
            method: 'POST',
            url: `/jobs/${job.id}/accept`,
            headers: { 'x-provider-id': String(providerId) }
        });
        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.payload);
        expect(body).toMatchObject({
            id: job.id,
            status: 'BOOKED',
            acceptedById: providerId
        });
    });

    it('POST /jobs/:id/accept again → 409', async () => {
        const res = await app.inject({
            method: 'POST',
            url: `/jobs/${job.id}/accept`,
            headers: { 'x-provider-id': String(providerId) }
        });
        expect(res.statusCode).toBe(409);
        expect(JSON.parse(res.payload)).toEqual({ error: 'Job already taken' });
    });

    it('POST /jobs/:id/cancel-by-provider → missing header → 400', async () => {
        const res = await app.inject({
            method: 'POST',
            url: `/jobs/${job.id}/cancel-by-provider`
        });
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.payload)).toEqual({
            error: 'Missing provider id header'
        });
    });

    it('POST /jobs/:id/cancel-by-provider → success → 200', async () => {
        const res = await app.inject({
            method: 'POST',
            url: `/jobs/${job.id}/cancel-by-provider`,
            headers: { 'x-provider-id': String(providerId) }
        });
        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.payload);
        expect(body.status).toBe('CANCELLED_BY_PROVIDER');
    });

    it('POST /jobs/:id/cancel-by-provider again → 409', async () => {
        const res = await app.inject({
            method: 'POST',
            url: `/jobs/${job.id}/cancel-by-provider`,
            headers: { 'x-provider-id': String(providerId) }
        });
        expect(res.statusCode).toBe(409);
        expect(JSON.parse(res.payload)).toEqual({ error: 'Cannot cancel job' });
    });

    it('DELETE /jobs/:id → delete → 200', async () => {
        const res = await app.inject({
            method: 'DELETE',
            url: `/jobs/${job.id}`
        });
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.payload)).toEqual({ success: true });
    });

    it('GET  /jobs/:id → after delete → 404', async () => {
        const res = await app.inject({
            method: 'GET',
            url: `/jobs/${job.id}`
        });
        expect(res.statusCode).toBe(404);
    });
});
