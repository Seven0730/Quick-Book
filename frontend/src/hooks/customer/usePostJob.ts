import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetcher } from '@/lib/api'
import type { Job } from '@/types'

export interface PostJobPayload {
    categoryId: number
    timeslot: string
    customerLat: number
    customerLon: number
    price?: number
    acceptPrice?: number
    jobType: 'QUICKBOOK' | 'POSTQUOTE'
}

export function usePostJob() {
    const qc = useQueryClient()

    return useMutation<Job, Error, PostJobPayload>({
        mutationFn: (payload) => {
            if(payload.price == null) {
                payload.price = payload.acceptPrice
            }
            return fetcher<Job>('/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    categoryId: payload.categoryId,
                    timeslot: payload.timeslot,
                    customerLat: payload.customerLat,
                    customerLon: payload.customerLon,
                    price: payload.price,
                    acceptPrice: payload.acceptPrice ?? null,
                    jobType: payload.jobType,
                }),
            })
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['customer-jobs'] })
            qc.invalidateQueries({ queryKey: ['post-quote-jobs'] })
        },
    })
}
