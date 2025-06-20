import { FastifyInstance } from 'fastify';
import prisma from '../../lib/prisma';

export async function escrowRoutes(app: FastifyInstance) {
    // create a new escrow hold
    app.post('/hold', async (req, reply) => {
        const { jobId, amount } = req.body as { jobId: number; amount: number };

        if (amount <= 0) {
            return reply.status(400).send("Amount must be greater than zero.");
        }

        const existingEscrow = await prisma.escrow.findFirst({
            where: { jobId, status: "HOLD" },
        });

        if (existingEscrow) {
            return reply.status(400).send("Funds are already held for this job.");
        }

        const escrow = await prisma.escrow.create({
            data: {
                jobId,
                amount,
                status: "HOLD",
            },
        });

        return reply.status(201).send(escrow);
    });

    // release funds from escrow
    app.post('/release', async (req, reply) => {
        const { jobId } = req.body as { jobId: number };

        const escrow = await prisma.escrow.findFirst({
            where: { jobId, status: "HOLD" },
        });

        if (!escrow) {
            return reply.status(404).send("No funds held for this job.");
        }

        const releasedEscrow = await prisma.escrow.update({
            where: { id: escrow.id },
            data: { status: "RELEASED" },
        });

        return reply.status(200).send(releasedEscrow);
    });
}
