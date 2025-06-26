import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useProviderContext } from '@/contexts/ProviderContext'
import { fetcher } from '@/lib/api'
import type { Bid } from '@/types'

export function useCancelBid() {
    const { providerId } = useProviderContext()
    const qc = useQueryClient()
    return useMutation<Bid, Error, { jobId: number }>({
        mutationFn: ({ jobId }) =>
            fetcher(`/jobs/${jobId}/cancel-by-provider`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-provider-id': String(providerId),
                },
                body: JSON.stringify({}),
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['provider-bids'] })
            qc.invalidateQueries({ queryKey: ['provider-bid'] })
        }
    })
}
