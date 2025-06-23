import prisma from '../../lib/prisma';

export const bidRepository = {
    create: (data: { jobId: number; providerId: number; price: number; note?: string }) =>
        prisma.bid.create({ data }),
    listByJob: (jobId: number) =>
        prisma.bid.findMany({
            where: { jobId },
            include: { provider: true, job: true, }
        }),
    findByJobAndProvider: (jobId: number, providerId: number) =>
        prisma.bid.findUnique({ where: { jobId_providerId: { jobId, providerId } } }),

    findById: (bidId: number) =>
        prisma.bid.findUnique({
            where: { id: bidId },
            include: { provider: true, job: true },
        }),

    deleteByJobId: (jobId: number) =>
        prisma.bid.deleteMany({ where: { jobId } }),
};
