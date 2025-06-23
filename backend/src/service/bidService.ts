import { bidRepository } from '../repository/bidRepository';
import { jobService } from './jobService';
import type { Bid } from '@prisma/client';
import { haversine } from '../utils/haversine';

const AVERAGE_SPEED_KMH = 60;

function normalize(value: number, min: number, max: number): number {
    if (max === min) return 0;
    return (value - min) / (max - min);
}

export const bidService = {
    list: (jobId: number): Promise<Bid[]> =>
        bidRepository.listByJob(jobId),

    create: async (jobId: number, providerId: number, price: number, note?: string): Promise<Bid> => {

        const existing = await bidRepository.findByJobAndProvider(jobId, providerId);
        if (existing) throw new Error('Already bid');

        const bid = await bidRepository.create({ jobId, providerId, price, note });

        // if the bid price is less than or equal to the job's accept price, automatically accept the job
        const job = await jobService.get(jobId);
        if (!job) {
            throw new Error('Job not found');
        }
        if (job.acceptPrice != null && price <= job.acceptPrice) {
            await jobService.accept(jobId, providerId);
        }

        return bid;
    },

    topBids: async (jobId: number): Promise<Array<Bid & { score: number }>> => {
        const bids = await bidRepository.listByJob(jobId);
        if (bids.length === 0) return [];

        const prices = bids.map(b => b.price);
        const ratings = bids.map(b => b.provider.rating);
        // calculate ETAs based on provider location and customer location
        const etas = bids.map(b => {
            const distKm = haversine(
                (b as any).job.customerLat,
                (b as any).job.customerLon,
                b.provider.lat,
                b.provider.lon
            );
            return (distKm / AVERAGE_SPEED_KMH) * 60;
        });

        const minPrice = Math.min(...prices), maxPrice = Math.max(...prices);
        const minEta = Math.min(...etas), maxEta = Math.max(...etas);

        // score = 0.5*normPrice + 0.3*(5-rating)/4 + 0.2*normETA
        const scored = bids.map((b, i) => {
            const pNorm = normalize(b.price, minPrice, maxPrice);
            const rNorm = ((5 - b.provider.rating) / 4);
            const eNorm = normalize(etas[i], minEta, maxEta);
            const score = 0.5 * pNorm + 0.3 * rNorm + 0.2 * eNorm;
            return { ...b, score };
        });
        
        // sort by score ascending
        scored.sort((a, b) => a.score - b.score);
        return scored.slice(0, 3);
    },
};
