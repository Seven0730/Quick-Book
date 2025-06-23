import { providerRepository } from '../repository/providerRepository';
import type { Provider } from '@prisma/client';

export const providerService = {
    list: (): Promise<Provider[]> =>
        providerRepository.findAll(),

    get: (id: number): Promise<Provider | null> =>
        providerRepository.findById(id),

    create: (data: {
        name: string;
        rating?: number;
        completed?: number;
        lat: number;
        lon: number;
        available?: boolean;
    }): Promise<Provider> =>
        providerRepository.create(data),

    update: (
        id: number,
        data: Partial<{
            name: string;
            rating: number;
            completed: number;
            lat: number;
            lon: number;
            available: boolean;
        }>
    ): Promise<Provider> =>
        providerRepository.update(id, data),

    delete: (id: number): Promise<Provider> =>
        providerRepository.delete(id),

    async decrementCompleted(id: number): Promise<Provider> {
        const prov = await providerRepository.findById(id);
        if (!prov) throw new Error('Provider not found');
        const newCount = Math.max(0, prov.completed - 1);
        return providerRepository.update(id, { completed: newCount });
    },
};
