import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@/lib/api';
import type { Job, Bid } from '@/types';

//
// Fetch all jobs created by this customer
//
export function useJobs() {
    return useQuery<Job[], Error>({
        queryKey: ['customer-jobs'],
        queryFn: () => fetcher<Job[]>('/jobs'),
        staleTime: 1000 * 60,
    });
}

//
// Fetch a single job’s details
//
export function useJob(jobId?: number) {
    return useQuery<Job, Error>({
        queryKey: ['customer-job', jobId],
        queryFn: () => fetcher<Job>(`/jobs/${jobId}`),
        enabled: Boolean(jobId),
    });
}

//
// Fetch all bids for a given job
//
export function useJobBids(jobId?: number) {
    return useQuery<Bid[], Error>({
        queryKey: ['customer-job-bids', jobId],
        queryFn: () => fetcher<Bid[]>(`/jobs/${jobId}/bids`),
        enabled: Boolean(jobId),
        staleTime: 1000 * 30,
    });
}
