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

    static async findById(
        req: FastifyRequest<{ Params: { bidId: string } }>,
        reply: FastifyReply
    ) {
        const bidId = Number(req.params.bidId);
        if (isNaN(bidId)) {
            return reply.status(400).send({ error: 'Invalid bidId' });
        }
        const bid = await bidService.findById(bidId);
        if (!bid) {
            return reply.status(404).send({ error: 'Bid not found' });
        }
        reply.send(bid);
    }

    static async listByProvider(
        req: FastifyRequest<{ Params: { providerId: string } }>,
        reply: FastifyReply
    ) {
        const pid = Number(req.params.providerId)
        if (isNaN(pid)) {
            return reply.status(400).send({ error: 'Invalid providerId' })
        }
        const bids = await bidService.listByProvider(pid)
        reply.send(bids)
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
    static async topBids(
        req: FastifyRequest<{ Params: { jobId: string } }>,
        reply: FastifyReply
    ) {
        const jobId = Number(req.params.jobId);
        const top3 = await bidService.topBids(jobId);
        return reply.send(top3);
    }
    static async selectBid(
        req: FastifyRequest<{
            Params: { jobId: string; bidId: string };
        }>,
        reply: FastifyReply
    ) {
        const jobId = Number(req.params.jobId);
        const bidId = Number(req.params.bidId);

        try {
            const job = await bidService.selectBid(jobId, bidId);

            getIO().emit('job-booked', job);

            return reply.send(job);
        } catch (err: any) {
            if (err.message === 'Bid not found for this job') {
                return reply.status(404).send({ error: err.message });
            }
            if (err.message === 'Job already taken') {
                return reply.status(409).send({ error: err.message });
            }
            req.log.error(err);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    }
}
