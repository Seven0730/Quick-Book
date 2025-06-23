import { jobRepo } from '../repository/jobRepository';
import { escrowService } from './escrowService';
import { providerService } from './providerService';
import { Job } from '@prisma/client';

export const jobService = {
    list: () => jobRepo.findAll(),
    get: (id: number) => jobRepo.findById(id),
    create: async (payload: {
        categoryId: number;
        price: number;
        timeslot: string;
        customerLat: number;
        customerLon: number;
    }): Promise<Job> => {
        const job = await jobRepo.create(payload);

        await escrowService.hold(job.id, job.price);
        return job;
    },
    update: (id: number, data: { price?: number; timeslot?: string; status?: string }) => jobRepo.update(id, data),
    delete: (id: number) => jobRepo.delete(id),

    async accept(id: number, providerId: number): Promise<Job> {
        const ok = await jobRepo.accept(id, providerId);
        if (!ok) throw new Error('Job already taken');
        const job = await jobRepo.findById(id);
        if (!job) throw new Error('Job not found');
        await escrowService.hold(job.id, job.price);
        return job;
    },


    async cancelByProvider(id: number, providerId: number): Promise<Job> {
        const ok = await jobRepo.cancelByProvider(id, providerId);
        if (!ok) throw new Error('Cannot cancel job');
        await escrowService.release(id);
        // Decrement the completed count for the provider
        await providerService.decrementCompleted(providerId);
        const job = await jobRepo.findById(id);
        if (!job) throw new Error('Job not found after cancel');
        return job;
    },
};