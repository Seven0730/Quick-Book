import { FastifyInstance } from 'fastify';
import { JobController } from '../controller/jobController';

export async function jobsRoutes(app: FastifyInstance) {
    app.get('/', JobController.list);
    app.get('/:id', JobController.get);
    app.post('/', JobController.create);
    app.put('/:id', JobController.update);
    app.delete('/:id', JobController.delete);
}