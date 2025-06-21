import prisma from '../../lib/prisma';

export const escrowRepo = {
    findHold: (jobId: number) => prisma.escrow.findFirst({ where: { jobId, status: 'HOLD' } }),
    createHold: (jobId: number, amount: number) =>
        prisma.escrow.create({ data: { jobId, amount, status: 'HOLD' } }),
    release: (id: number) => prisma.escrow.update({ where: { id }, data: { status: 'RELEASED' } }),
};