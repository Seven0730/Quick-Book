import {
    FastifyInstance,
    FastifyRequest,
    FastifyReply
} from 'fastify';
import { providerService } from '../service/providerService';

export class ProviderController {
    static async list(
        this: FastifyInstance,
        req: FastifyRequest,
        reply: FastifyReply
    ) {
        const providers = await providerService.list();
        reply.send(providers);
    }

    static async get(
        this: FastifyInstance,
        req: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        const id = Number(req.params.id);
        const provider = await providerService.get(id);
        if (!provider) {
            return reply.status(404).send({ error: 'Provider not found' });
        }
        reply.send(provider);
    }

    static async create(
        this: FastifyInstance,
        req: FastifyRequest,
        reply: FastifyReply
    ) {
        const body = req.body as {
            name: string;
            lat: number;
            lon: number;
            rating?: number;
            completed?: number;
            available?: boolean;
        };
        const provider = await providerService.create(body);
        reply.status(201).send(provider);
    }

    static async toggleAvailability(
        this: FastifyInstance,
        req: FastifyRequest<{ Params: { id: string }; Body: { available: boolean } }>,
        reply: FastifyReply
    ) {
        const id = Number(req.params.id);
        const { available } = req.body;
        const updated = await providerService.update(id, { available });
        reply.send(updated);
    }

    static async delete(
        this: FastifyInstance,
        req: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        const id = Number(req.params.id);
        await providerService.delete(id);
        reply.send({ success: true });
    }
}
