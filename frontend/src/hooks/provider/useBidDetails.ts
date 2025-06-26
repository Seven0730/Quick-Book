import { useQuery } from '@tanstack/react-query'
import { fetcher } from '@/lib/api'
import type { Bid } from '@/types'

export function useBidDetails(bidId?: number) {
    return useQuery<Bid, Error>({
        queryKey: ['provider-bid', bidId],
        queryFn: () => fetcher(`/bids/${bidId}`),
        enabled: !!bidId,
    })
}
