import { z } from 'zod';

export const jobSchema = z.object({
    categoryId: z.number().min(1),
    price: z.number().min(0),
    timeslot: z.string().min(1),
});
