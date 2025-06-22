import { z } from 'zod';

export const escrowHoldSchema = z.object({
    jobId: z.number().min(1),
    amount: z.number().min(0),
});
export const escrowReleaseSchema = z.object({
    jobId: z.number().min(1),
});