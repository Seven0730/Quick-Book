import { FastifyInstance } from 'fastify';
import { ProviderController } from '../controller/providerController';

export async function providersRoutes(app: FastifyInstance) {
    app.get('/', ProviderController.list);
    app.get('/:id', ProviderController.get);
    app.post('/', ProviderController.create);
    app.patch('/:id/availability', ProviderController.toggleAvailability);
    app.delete('/:id', ProviderController.delete);
}
