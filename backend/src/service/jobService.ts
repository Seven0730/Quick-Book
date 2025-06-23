import { jobRepo } from '../repository/jobRepository';
import { escrowService } from './escrowService';
import { providerService } from './providerService';
import { getIO, providerSockets } from '../socket';
import { haversine } from '../utils/haversine';
import { Job } from '@prisma/client';

const STAGE1_RADIUS_KM = 3;
const STAGE2_RADIUS_KM = 10;
const STAGE1_DELAY_MS = 0;
const STAGE2_DELAY_MS = 5 * 60 * 1000;  // 5 minutes
const STAGE3_DELAY_MS = 15 * 60 * 1000; // 15 minutes

function isTierA(p: { rating: number; completed: number }) {
    return p.rating >= 4.5 && p.completed >= 50;
}

async function broadcastStage(job: Job, stage: 1 | 2 | 3) {
    const io = getIO();
    const providers = await providerService.list();

    for (const p of providers) {
        const info = providerSockets.get(p.id);
        if (!info) continue;

        const distance = haversine(
            job.customerLat,
            job.customerLon,
            p.lat,
            p.lon
        );

        let shouldNotify = false;
        if (stage === 1) {
            // Tier-A
            shouldNotify = isTierA(p) && distance <= STAGE1_RADIUS_KM;
        } else if (stage === 2) {
            // Tier-B
            shouldNotify = !isTierA(p) && distance <= STAGE2_RADIUS_KM;
        } else {
            // Stage 3
            shouldNotify = true;
        }

        if (shouldNotify) {
            io.to(info.socketId).emit('new-job', job);
        }
    }
}

export const jobService = {
    list: () => jobRepo.findAll(),
    get: (id: number) => jobRepo.findById(id),
    create: async (payload: {
        categoryId: number;
        price: number;
        timeslot: string;
        customerLat: number;
        customerLon: number;
    }): Promise<Job> => {
        const job = await jobRepo.create(payload);

        await escrowService.hold(job.id, job.price);

        // broadcast in 3 stages
        // Stage 1
        setTimeout(async () => {
            const fresh = await jobRepo.findById(job.id);
            if (fresh?.status === 'PENDING') {
                await broadcastStage(fresh, 1);
            }
        }, STAGE1_DELAY_MS);

        // Stage 2
        setTimeout(async () => {
            const fresh = await jobRepo.findById(job.id);
            if (fresh?.status === 'PENDING') {
                await broadcastStage(fresh, 2);
            }
        }, STAGE2_DELAY_MS);

        // Stage 3
        setTimeout(async () => {
            const fresh = await jobRepo.findById(job.id);
            if (fresh?.status === 'PENDING') {
                await broadcastStage(fresh, 3);
            }
        }, STAGE3_DELAY_MS);
        return job;
    },
    update: (id: number, data: { price?: number; timeslot?: string; status?: string }) => jobRepo.update(id, data),
    delete: (id: number) => jobRepo.delete(id),

    async accept(id: number, providerId: number): Promise<Job> {
        const ok = await jobRepo.accept(id, providerId);
        if (!ok) throw new Error('Job already taken');
        const job = await jobRepo.findById(id);
        if (!job) throw new Error('Job not found');
        await escrowService.hold(job.id, job.price);
        return job;
    },


    async cancelByProvider(id: number, providerId: number): Promise<Job> {
        const ok = await jobRepo.cancelByProvider(id, providerId);
        if (!ok) throw new Error('Cannot cancel job');
        await escrowService.release(id);
        // Decrement the completed count for the provider
        await providerService.decrementCompleted(providerId);
        const job = await jobRepo.findById(id);
        if (!job) throw new Error('Job not found after cancel');
        return job;
    },
};