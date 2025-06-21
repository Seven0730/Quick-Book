import { escrowRepo } from '../repository/escrowRepository';

export const escrowService = {
  hold: async (jobId: number, amount: number) => {
    const existing = await escrowRepo.findHold(jobId);
    if (existing) throw new Error('Already held');
    return escrowRepo.createHold(jobId, amount);
  },
  release: async (jobId: number) => {
    const existing = await escrowRepo.findHold(jobId);
    if (!existing) throw new Error('Nothing to release');
    return escrowRepo.release(existing.id);
  },
};