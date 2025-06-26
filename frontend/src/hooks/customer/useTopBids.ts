import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/api';
import type { Bid } from '@/types';

export function useTopBids(jobId?: number) {
    return useQuery<Bid[], Error>({
        queryKey: ['top-bids', jobId],
        queryFn: () => fetcher(`/jobs/${jobId}/top-bids`),
        enabled: !!jobId,
    });
}
