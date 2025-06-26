import { FastifyInstance } from 'fastify';
import { BidController } from '../controller/bidController';

export async function bidsRoutes(app: FastifyInstance) {
    app.get('/jobs/:jobId/bids', BidController.list);
    app.post('/jobs/:jobId/bids', BidController.create);
    app.get('/jobs/:jobId/top-bids', BidController.topBids);
    app.post('/jobs/:jobId/bids/:bidId/select', BidController.selectBid);
    app.get('/jobs/bids/:providerId',BidController.listByProvider);
    app.get('/bids/:bidId', BidController.findById);
}
