import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/api';

interface Guidance { p10: number; p50: number; p90: number; }

export function usePriceGuidance(categoryId?: number) {
    return useQuery<Guidance, Error>({
        queryKey: ['price-guidance', categoryId],
        queryFn: () => fetcher(`/jobs/price-guidance?categoryId=${categoryId}`),
        enabled: !!categoryId,
    });
}