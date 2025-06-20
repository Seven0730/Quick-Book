import { FastifyInstance } from 'fastify';
import prisma from '../../lib/prisma';

export async function categoriesRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return prisma.category.findMany();
  });
}
