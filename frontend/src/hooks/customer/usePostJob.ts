import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetcher } from '@/lib/api'
import { toast } from 'react-hot-toast'
import type { Job } from '@/types'

export interface PostJobPayload {
    categoryId: number
    timeslot: string
    customerLat: number
    customerLon: number
    price?: number
    acceptPrice?: number
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
                }),
            })
        },
        onMutate: () => {
            toast.loading('Posting job…')
        },
        onSuccess: (job) => {
            toast.dismiss()
            toast.success(`Job #${job.id} posted`)
            qc.invalidateQueries({ queryKey: ['customer-jobs'] })
            qc.invalidateQueries({ queryKey: ['post-quote-jobs'] })
        },
        onError: (err) => {
            toast.dismiss()
            toast.error(`Post failed: ${err.message}`)
        },
    })
}
