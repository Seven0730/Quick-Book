import { FastifyReply, FastifyRequest } from 'fastify';
import { jobService } from '../service/jobService';

export class JobController {
    static async list(req: FastifyRequest, reply: FastifyReply) {
        const data = await jobService.list();
        reply.send(data);
    }
    static async get(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = Number(req.params.id);
        const item = await jobService.get(id);
        if (!item) return reply.status(404).send('Not found');
        reply.send(item);
    }
    static async create(req: FastifyRequest, reply: FastifyReply) {
        const body = req.body as { categoryId: number; price: number; timeslot: string };
        const item = await jobService.create(body);
        (req.server as any).io.emit('new-job', item);  //TODO: fix type error
        reply.status(201).send(item);
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
}