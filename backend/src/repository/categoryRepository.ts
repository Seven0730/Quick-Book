import prisma from '../../lib/prisma';

export const categoryRepo = {
    findAll: () => prisma.category.findMany(),
    findById: (id: number) => prisma.category.findUnique({ where: { id } }),
    create: (name: string) => prisma.category.create({ data: { name } }),
    update: (id: number, name: string) => prisma.category.update({ where: { id }, data: { name } }),
    delete: (id: number) => prisma.category.delete({ where: { id } }),
};
