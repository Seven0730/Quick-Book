import { FastifyReply, FastifyRequest, FastifyInstance } from 'fastify';
import { bidService } from '../service/bidService';
import { getIO } from '../socket';

export class BidController {
    static async list(
        req: FastifyRequest<{ Params: { jobId: string } }>,
        reply: FastifyReply
    ) {
        const bids = await bidService.list(+req.params.jobId);
        reply.send(bids);
    }

    static async create(
        this: FastifyInstance,
        req: FastifyRequest<{ Params: { jobId: string }; Body: { providerId: number; price: number; note?: string } }>,
        reply: FastifyReply
    ) {
        const jobId = +req.params.jobId;
        const { providerId, price, note } = req.body;
        try {
            const bid = await bidService.create(jobId, providerId, price, note);
            // Emit bid-received event to notify providers
            getIO().emit(`bid-received-${jobId}`, bid);
            reply.status(201).send(bid);
        } catch (err: any) {
            if (err.message === 'Already bid') {
                return reply.status(409).send({ error: err.message });
            }
            throw err;
        }
    }
}
