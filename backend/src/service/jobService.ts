import { jobRepo } from '../repository/jobRepository';
import { escrowService } from './escrowService';
import { Job } from '@prisma/client';

export const jobService = {
    list: () => jobRepo.findAll(),
    get: (id: number) => jobRepo.findById(id),
    create: (data: { categoryId: number; price: number; timeslot: string }) => jobRepo.create(data),
    update: (id: number, data: { price?: number; timeslot?: string; status?: string }) => jobRepo.update(id, data),
    delete: (id: number) => jobRepo.delete(id),

    accept: async (id: number): Promise<Job> => {
        const ok = await jobRepo.accept(id);
        if (!ok) throw new Error('Job already taken');

        const job = await jobRepo.findById(id);
        if (!job) throw new Error('Job not found');

        await escrowService.hold(job.id, job.price);
        return job;
    },
};