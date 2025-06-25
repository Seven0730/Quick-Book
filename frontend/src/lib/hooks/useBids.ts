import { useQuery } from '@tanstack/react-query';
import { fetcher } from '../api';
import type { Bid } from '@/types';

export function useBids(jobId?: number) {
    return useQuery<Bid[], Error>({
        queryKey: ['bids', jobId],
        queryFn: () => fetcher<Bid[]>(`/jobs/${jobId}/bids`),
        enabled: Boolean(jobId),
        staleTime: 1000 * 60,
    });
}
