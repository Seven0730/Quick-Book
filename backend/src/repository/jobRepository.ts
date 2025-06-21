import prisma from '../../lib/prisma';

export const jobRepo = {
    findAll: () => prisma.job.findMany({ include: { category: true } }),
    findById: (id: number) => prisma.job.findUnique({ where: { id }, include: { category: true } }),
    create: (data: { categoryId: number; price: number; timeslot: string }) =>
        prisma.job.create({ data }),
    update: (id: number, data: { price?: number; timeslot?: string; status?: string }) =>
        prisma.job.update({ where: { id }, data }),
    delete: (id: number) => prisma.job.delete({ where: { id } }),
};