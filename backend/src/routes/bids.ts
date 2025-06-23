import { FastifyInstance } from 'fastify';
import { BidController } from '../controller/bidController';

export async function bidsRoutes(app: FastifyInstance) {
    app.get('/jobs/:jobId/bids', BidController.list);
    app.post('/jobs/:jobId/bids', BidController.create);
    app.get('/jobs/:jobId/top-bids', BidController.topBids);
}
