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
};
