import { bidRepository } from '../repository/bidRepository';
import { jobService } from './jobService';
import type { Bid } from '@prisma/client';

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
    }
};
