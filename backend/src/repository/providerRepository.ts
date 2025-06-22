import prisma from '../../lib/prisma';

export const providerRepository = {
    findAll: () =>
        prisma.provider.findMany(),

    findById: (id: number) =>
        prisma.provider.findUnique({ where: { id } }),

    create: (data: {
        name: string;
        rating?: number;
        completed?: number;
        lat: number;
        lon: number;
        available?: boolean;
    }) =>
        prisma.provider.create({ data }),

    update: (id: number, data: Partial<{
        name: string;
        rating: number;
        completed: number;
        lat: number;
        lon: number;
        available: boolean;
    }>) =>
        prisma.provider.update({ where: { id }, data }),

    delete: (id: number) =>
        prisma.provider.delete({ where: { id } }),
};
