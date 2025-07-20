import { FastifyReply, FastifyRequest } from 'fastify';
import { jobService } from '../service/jobService';
import { providerService } from '../service/providerService';
import { getIO, providerSockets } from '../socket';
import { haversine } from '../utils/haversine';

export class JobController {
    static async list(
        req: FastifyRequest<{ Querystring: { status?: string; jobType?: 'QUICKBOOK' | 'POSTQUOTE' } }>,
        reply: FastifyReply
    ) {
        const { status, jobType } = req.query;
        const jobs = await jobService.list(status, jobType);
        const visible = jobs.filter(j => j.status !== 'DESTROYED');
        return reply.send(visible);
    }
    static async get(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = Number(req.params.id);
        const item = await jobService.get(id);
        if (!item) return reply.status(404).send('Not found');
        reply.send(item);
    }

    static async create(
        req: FastifyRequest,
        reply: FastifyReply
    ) {
        const { categoryId, price, timeslot, customerLat, customerLon, acceptPrice, jobType } =
            req.body as {
                categoryId: number;
                price: number;
                timeslot: string;
                customerLat: number;
                customerLon: number;
                acceptPrice?: number;
                jobType?: 'QUICKBOOK' | 'POSTQUOTE';
            };

        const job = await jobService.create({
            categoryId, price, timeslot, customerLat, customerLon, acceptPrice, jobType
        });

        // get all available provider sockets
        const providers = await providerService.list();
        const io = getIO();

        // send job to all providers within 5km
        for (const p of providers) {
            const d = haversine(customerLat, customerLon, p.lat, p.lon);
            if (d <= 5) {
                const sockId = providerSockets.get(p.id)?.socketId;
                if (sockId) {
                    io.to(sockId).emit('new-job', job);
                }
            }
        }

        return reply.status(201).send(job);
    }
    static async update(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = Number(req.params.id);
        const body = req.body as Partial<{ price: number; timeslot: string; status: string }>;
        const item = await jobService.update(id, body);
        reply.send(item);
    }
    static async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = Number(req.params.id);
        await jobService.delete(id);
        reply.send({ success: true });
    }

    static async accept(
        req: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        const id = Number(req.params.id);

        const providerHeader = req.headers['x-provider-id'];
        const providerId = providerHeader ? Number(providerHeader) : NaN;
        if (!providerHeader || isNaN(providerId)) {
            return reply
                .status(400)
                .send({ error: 'Missing or invalid x-provider-id header' });
        }

        try {
            const job = await jobService.accept(id, providerId);

            getIO().emit('job-booked', job);

            return reply.send(job);
        } catch (err: any) {
            if (err.message === 'Job already taken') {
                return reply.status(409).send({ error: err.message });
            }
            req.log.error(err);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    }
    static async cancelByProvider(
        req: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        const jobId = Number(req.params.id);
        const providerId = Number(req.headers['x-provider-id']);
        if (!providerId) {
            return reply.status(400).send({ error: 'Missing provider id header' });
        }

        try {
            const job = await jobService.cancelByProvider(jobId, providerId);
            // broadcast cancellation to all connected WebSocket clients
            getIO().emit('job-cancelled', { jobId: job.id, by: 'provider' });
            return reply.send(job);
        } catch (err: any) {
            if (err.message === 'Cannot cancel job') {
                return reply.status(409).send({ error: err.message });
            }
            req.log.error(err);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    }
    static async priceGuidance(
        req: FastifyRequest,
        reply: FastifyReply
    ) {
        const categoryId = Number((req.query as any).categoryId);
        if (!categoryId) {
            return reply.status(400).send({ error: 'Invalid categoryId' });
        }
        try {
            const result = await jobService.priceGuidance(categoryId);
            return reply.send(result);
        } catch (err: any) {
            req.log.error(err);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    }
}