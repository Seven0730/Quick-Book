import Fastify from 'fastify';
import cors from '@fastify/cors';
import { providersRoutes } from '../src/routes/providers';
import prisma from '../src/lib/prisma';

let app: ReturnType<typeof Fastify>;

beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await prisma.escrow.deleteMany();
    await prisma.bid.deleteMany();
    await prisma.job.deleteMany();
    await prisma.provider.deleteMany();
    app = Fastify();
    await app.register(cors, { origin: '*' });
    app.register(providersRoutes, { prefix: '/providers' });
    await app.listen({ port: 0 });
});

afterAll(async () => {
    await prisma.provider.deleteMany();
    await app.close();
    await prisma.$disconnect();
});

describe('Provider Endpoints', () => {
    it('GET /providers initially empty', async () => {
        const res = await app.inject({ method: 'GET', url: '/providers' });
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.payload)).toEqual([]);
    });

    let prov: any;
    it('POST /providers should create', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/providers',
            payload: { name: 'P1', lat: 1.3, lon: 103.8 }
        });
        expect(res.statusCode).toBe(201);
        prov = JSON.parse(res.payload);
        expect(prov).toMatchObject({ name: 'P1', available: true });
        expect(typeof prov.id).toBe('number');
    });

    it('GET /providers/:id should return it', async () => {
        const res = await app.inject({
            method: 'GET',
            url: `/providers/${prov.id}`
        });
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.payload)).toEqual(prov);
    });

    it('PATCH /providers/:id/availability toggles', async () => {
        const res = await app.inject({
            method: 'PATCH',
            url: `/providers/${prov.id}/availability`,
            payload: { available: false }
        });
        expect(res.statusCode).toBe(200);
        const updated = JSON.parse(res.payload);
        expect(updated.available).toBe(false);
    });

    it('DELETE /providers/:id should delete', async () => {
        const res = await app.inject({
            method: 'DELETE',
            url: `/providers/${prov.id}`
        });
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.payload)).toEqual({ success: true });
        const res2 = await app.inject({ method: 'GET', url: `/providers/${prov.id}` });
        expect(res2.statusCode).toBe(404);
    });
});
