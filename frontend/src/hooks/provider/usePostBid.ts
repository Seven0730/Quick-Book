import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetcher } from '@/lib/api'
import type { Bid } from '@/types'

export function usePostBid() {
  const qc = useQueryClient()

  return useMutation<Bid, Error, { jobId: number; providerId: number; price: number; note?: string }>({
    mutationFn: ({ jobId, providerId, price, note }) =>
      fetcher<Bid>(`/jobs/${jobId}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-provider-id': String(providerId) },
        body: JSON.stringify({ providerId, price, note }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider-post-quote-jobs'] })
    },
  })
}
