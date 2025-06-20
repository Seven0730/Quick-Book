import { FastifyInstance } from 'fastify';
import prisma from '../../lib/prisma';
import { jobSchema } from '../schemas/job';

export async function jobsRoutes(app: FastifyInstance) {
  app.post('/', async (req, reply) => {

    const { categoryId, price, timeslot } = jobSchema.parse(req.body);

    const job = await prisma.job.create({
      data: { categoryId, price, timeslot },
    });

    return job;
  });
}
