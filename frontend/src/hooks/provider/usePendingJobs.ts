import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/api';
import type { Job } from '@/types';

/**
 * Fetch all PENDING jobs (for Quick-Book broadcasts).
 */
export function usePendingJobs() {
    return useQuery<Job[], Error>({
        queryKey: ['provider-pending-jobs'],
        queryFn: () => fetcher<Job[]>('/jobs?status=PENDING'),
        staleTime: 30 * 1000,  // refetch every 30s
    });
}
