import { FastifyInstance } from 'fastify';
import prisma from '../../lib/prisma';
import { z } from 'zod';

export async function jobsRoutes(app: FastifyInstance) {
    // get all jobs
    app.get('/', async (req, reply) => {
        try {
            const jobs = await prisma.job.findMany({
                include: {
                    category: true,
                },
            });
            return jobs;
        } catch (error) {
            reply.status(500).send('Error retrieving jobs');
        }
    });

    // get a single job by ID
    app.get('/:id', async (req, reply) => {
        const { id } = req.params as { id: string };
        try {
          const job = await prisma.job.findUnique({
            where: { id: Number(id) },
            include: { category: true },
          });
          if (job) {
            return job;
          } else {
            reply.status(404).send('Job not found');
          }
        } catch (error) {
          reply.status(500).send('Error retrieving job');
        }
      });

    // create a new job
    app.post('/', async (req, reply) => {
        const body = req.body as { categoryId: number, price: number, timeslot: string };

        const jobSchema = z.object({
            categoryId: z.number().min(1, "Category ID is required"),
            price: z.number().min(1, "Price should be greater than 0"),
            timeslot: z.string().min(1, "Timeslot is required"),
        });

        try {
            jobSchema.parse(body);

            const job = await prisma.job.create({
                data: {
                    categoryId: body.categoryId,
                    price: body.price,
                    timeslot: body.timeslot,
                },
            });

            reply.status(201).send(job);
        } catch (error) {
            reply.status(400).send('Invalid data');
        }
    });

    // update a job by ID
    app.put('/:id', async (req, reply) => {
        const { id } = req.params as { id: string };
        const body = req.body as { price: number; timeslot: string };
        const jobSchema = z.object({
          price: z.number().min(1, 'Price should be greater than 0'),
          timeslot: z.string().min(1, 'Timeslot is required'),
        });
    
        try {
          jobSchema.parse(body);
          const job = await prisma.job.update({
            where: { id: Number(id) },
            data: { price: body.price, timeslot: body.timeslot },
          });
          reply.status(200).send(job);
        } catch (error) {
          reply.status(400).send('Invalid data or Job not found');
        }
      });

      // delete a job by ID
      app.delete('/:id', async (req, reply) => {
        const { id } = req.params as { id: string };
        try {
          const job = await prisma.job.delete({
            where: { id: Number(id) },
          });
          reply.status(200).send(job);
        } catch (error) {
          reply.status(404).send('Job not found');
        }
      });
}
