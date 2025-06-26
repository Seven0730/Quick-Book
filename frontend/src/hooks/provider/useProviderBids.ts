import { useQuery } from '@tanstack/react-query'
import { fetcher } from '@/lib/api'
import type { Bid } from '@/types'

export function useProviderBids(providerId?: number) {

    return useQuery<Bid[], Error>({
        queryKey: ['provider-bids', providerId],
        queryFn: () => fetcher<Bid[]>(`/jobs/bids/${providerId}`),
        enabled: !!providerId,
        staleTime: 60_000,
    })
}
