import { escrowRepository } from '../repository/escrowRepository';

export const escrowService = {
  hold: async (jobId: number, amount: number) => {
    const existing = await escrowRepository.findHold(jobId);
    if (existing) throw new Error('Already held');
    return escrowRepository.createHold(jobId, amount);
  },
  release: async (jobId: number) => {
    const existing = await escrowRepository.findHold(jobId);
    if (!existing) throw new Error('Nothing to release');
    return escrowRepository.release(existing.id);
  },
};