import { FastifyInstance } from 'fastify';
import { CategoryController } from '../controller/categoryController';

export async function categoriesRoutes(app: FastifyInstance) {
    app.get('/', CategoryController.list);
    app.get('/:id', CategoryController.get);
    app.post('/', CategoryController.create);
    app.put('/:id', CategoryController.update);
    app.delete('/:id', CategoryController.delete);
}