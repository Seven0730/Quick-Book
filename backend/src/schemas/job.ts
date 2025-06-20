import { z } from 'zod';

export const jobSchema = z.object({
    categoryId: z.number(),
    price: z.number(),
    timeslot: z.string(),
});
