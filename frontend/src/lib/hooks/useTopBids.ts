import { useQuery } from '@tanstack/react-query';
import { fetcher } from '../api';
import type { Bid } from '@/types';

export function useTopBids(jobId?: number) {
    return useQuery<Bid[], Error>({
        queryKey: ['top-bids', jobId],
        queryFn: () => fetcher<Bid[]>(`/jobs/${jobId}/top-bids`),
        enabled: Boolean(jobId),
        staleTime: 1000 * 60,
    });
}
