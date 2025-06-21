import { FastifyReply, FastifyRequest } from 'fastify';
import { escrowService } from '../service/escrowService';

export class EscrowController {
    static async hold(req: FastifyRequest, reply: FastifyReply) {
        const { jobId, amount } = req.body as { jobId: number; amount: number };
        try {
            const escrow = await escrowService.hold(jobId, amount);
            reply.status(201).send(escrow);
        } catch (e: any) {
            reply.status(400).send(e.message);
        }
    }
    static async release(req: FastifyRequest, reply: FastifyReply) {
        const { jobId } = req.body as { jobId: number };
        try {
            const escrow = await escrowService.release(jobId);
            reply.send(escrow);
        } catch (e: any) {
            reply.status(400).send(e.message);
        }
    }
}