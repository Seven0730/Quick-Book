import prisma from '../lib/prisma';
import type { Job } from '@prisma/client';

export const jobRepository = {
    findAll: (status?: string, jobType?: 'QUICKBOOK' | 'POSTQUOTE'): Promise<Job[]> => {
        const where: any = {};
        if (status) where.status = status;
        if (jobType) where.jobType = jobType;
        return prisma.job.findMany({ where });
    },
    findById: (id: number) => prisma.job.findUnique({ where: { id }, include: { category: true } }),
    create: (data: {
        categoryId: number;
        price: number;
        timeslot: string;
        customerLat: number;
        customerLon: number;
        acceptPrice?: number;
        jobType?: 'QUICKBOOK' | 'POSTQUOTE';
    }) => prisma.job.create({ data }),
    update: (id: number, data: { price?: number; timeslot?: string; status?: string }) =>
        prisma.job.update({ where: { id }, data }),
    delete: (id: number) => prisma.job.delete({ where: { id } }),

    accept: async (id: number, providerId: number): Promise<boolean> => {
        const res = await prisma.job.updateMany({
            where: { id, status: 'PENDING' },
            data: { status: 'BOOKED', acceptedById: providerId },
        });
        return res.count === 1;
    },
    cancelByProvider: async (id: number, providerId: number): Promise<boolean> => {
        const res = await prisma.job.updateMany({
            where: { id, status: 'BOOKED', acceptedById: providerId },
            data: { status: 'CANCELLED_BY_PROVIDER' },
        });
        return res.count === 1;
    },
    findCompletedPricesByCategory: async (categoryId: number): Promise<number[]> => {
        const records = await prisma.job.findMany({
            where: {
                categoryId,
                status: 'COMPLETED',
            },
            select: {
                price: true,
            },
        });
        return records.map(r => r.price);
    },
    findByProvider: (providerId: number) =>
        prisma.bid.findMany({
            where: { providerId },
            include: {
                job: {
                    select: {
                        id: true,
                        status: true,
                        acceptedById: true,
                        price: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        }),
    findByType: (jobType: 'QUICKBOOK' | 'POSTQUOTE') =>
        prisma.job.findMany({ where: { jobType } }),
};