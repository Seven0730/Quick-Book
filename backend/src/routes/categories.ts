import { FastifyInstance } from 'fastify';
import prisma from '../../lib/prisma';
import { z } from 'zod';

export async function categoriesRoutes(app: FastifyInstance) {
    
    // get all categories
    app.get('/', async (req, reply) => {
        try {
            const categories = await prisma.category.findMany();
            return categories;
        } catch (error) {
            reply.status(500).send('Error retrieving categories');
        }
    });

    // get a single category by ID
    app.get('/:id', async (req, reply) => {
        const { id } = req.params as { id: string };
        try {
            const category = await prisma.category.findUnique({
                where: { id: Number(id) },
            });
            if (category) {
                return category;
            } else {
                reply.status(404).send('Category not found');
            }
        } catch (error) {
            reply.status(500).send('Error retrieving category');
        }
    });

    // update a category by ID
    app.put('/:id', async (req, reply) => {
        const { id } = req.params as { id: string };
        const body = req.body as { name: string };
        const categorySchema = z.object({
            name: z.string().min(1, 'Name is required'),
        });

        try {
            categorySchema.parse(body);  // 校验请求体数据
            const category = await prisma.category.update({
                where: { id: Number(id) },
                data: { name: body.name },
            });
            reply.status(200).send(category);
        } catch (error) {
            reply.status(400).send('Invalid data or Category not found');
        }
    });

    // create a new category
    app.post('/', async (req, reply) => {
        const body = req.body as { name: string };
        const categorySchema = z.object({
            name: z.string().min(1, "Name is required")
        });

        try {
            categorySchema.parse(body);

            const category = await prisma.category.create({
                data: { name: body.name },
            });

            reply.status(201).send(category);
        } catch (error) {
            reply.status(400).send('Invalid data');
        }
    });

    // delete a category by ID
    app.delete('/:id', async (req, reply) => {
        const { id } = req.params as { id: string };
        try {
            const category = await prisma.category.delete({
                where: { id: Number(id) },
            });
            reply.status(200).send(category);
        } catch (error) {
            reply.status(404).send('Category not found');
        }
    });
}
