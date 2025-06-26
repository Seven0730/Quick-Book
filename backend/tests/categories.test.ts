import Fastify from 'fastify';
import cors from '@fastify/cors';
import { categoriesRoutes } from '../src/routes/categories';
import prisma from '../src/lib/prisma';

let app: ReturnType<typeof Fastify>;

beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await prisma.category.deleteMany();
    app = Fastify();
    await app.register(cors, { origin: '*' });
    app.register(categoriesRoutes, { prefix: '/categories' });
    await app.listen({ port: 0 });
});

afterAll(async () => {
    await prisma.category.deleteMany();
    await app.close();
    await prisma.$disconnect();
});

describe('Category Endpoints', () => {
    it('GET /categories initially empty', async () => {
        const res = await app.inject({ method: 'GET', url: '/categories' });
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.payload)).toEqual([]);
    });

    let cat: any;
    it('POST /categories should create', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/categories',
            payload: { name: 'TestCat' }
        });
        expect(res.statusCode).toBe(201);
        cat = JSON.parse(res.payload);
        expect(cat).toMatchObject({ name: 'TestCat' });
        expect(typeof cat.id).toBe('number');
    });

    it('GET /categories/:id should return it', async () => {
        const res = await app.inject({
            method: 'GET',
            url: `/categories/${cat.id}`
        });
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.payload)).toEqual(cat);
    });

    it('POST duplicate should 409', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/categories',
            payload: { name: 'TestCat' }
        });
        expect(res.statusCode).toBe(409);
    });

    it('DELETE /categories/:id should delete', async () => {
        const res = await app.inject({
            method: 'DELETE',
            url: `/categories/${cat.id}`
        });
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.payload)).toEqual({ success: true });
        const res2 = await app.inject({ method: 'GET', url: `/categories/${cat.id}` });
        expect(res2.statusCode).toBe(404);
    });
});
