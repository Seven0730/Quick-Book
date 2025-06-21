import { jobRepo } from '../repository/jobRepository';

export const jobService = {
    list: () => jobRepo.findAll(),
    get: (id: number) => jobRepo.findById(id),
    create: (data: { categoryId: number; price: number; timeslot: string }) => jobRepo.create(data),
    update: (id: number, data: { price?: number; timeslot?: string; status?: string }) => jobRepo.update(id, data),
    delete: (id: number) => jobRepo.delete(id),
};