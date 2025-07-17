import { useQuery } from '@tanstack/react-query'
import { fetcher } from '@/lib/api'
import type { Job } from '@/types'

/**
 * Fetch all jobs in the "post & quote" pipeline that
 * this provider is eligible for bidding.
 */
export function usePendingPostQuoteJobs(providerId?: number) {
    return useQuery<Job[], Error>({
        queryKey: ['provider-post-quote-jobs', providerId],
        queryFn: () => fetcher(`/jobs?status=PENDING&jobType=POSTQUOTE`),
        enabled: !!providerId,
        // background refetch every 30s
        refetchInterval: 30_000,
    })
}
