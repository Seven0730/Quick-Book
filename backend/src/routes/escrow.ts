import { FastifyInstance } from 'fastify';
import { EscrowController } from '../controller/escrowController';

export async function escrowRoutes(app: FastifyInstance) {
    app.post('/hold', EscrowController.hold);
    app.post('/release', EscrowController.release);
}