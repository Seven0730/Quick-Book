import { FastifyReply, FastifyRequest } from 'fastify';
import { categoryService } from '../service/categoryService';

export class CategoryController {
    static async list(req: FastifyRequest, reply: FastifyReply) {
        const data = await categoryService.list();
        reply.send(data);
    }
    static async get(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = Number(req.params.id);
        const item = await categoryService.get(id);
        if (!item) return reply.status(404).send('Not found');
        reply.send(item);
    }
static async create(
    req: FastifyRequest,
    reply: FastifyReply
  ) {
    const { name } = req.body as { name: string };
    try {
      const cat = await categoryService.create(name);
      return reply.status(201).send(cat);
    } catch (err: any) {
      if (
        err.code === 'P2002'
      ) {
        return reply
          .status(409)
          .send({ error: 'Category already exists' });
      }
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  }
    static async update(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = Number(req.params.id);
        const { name } = req.body as { name: string };
        const item = await categoryService.update(id, name);
        reply.send(item);
    }
    static async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = Number(req.params.id);
        await categoryService.delete(id);
        reply.send({ success: true });
    }
}