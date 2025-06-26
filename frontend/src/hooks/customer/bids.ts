import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@/lib/api';
import type { Bid } from '@/types';

export function useSelectBid(jobId: number) {
    const qc = useQueryClient();
    return useMutation<Bid, Error, { bidId: number }>({
        mutationFn: ({ bidId }) =>
            fetcher<Bid>(`/jobs/${jobId}/bids/${bidId}/select`, {
                method: 'POST',
            }),
        onSuccess: () => {
            // update the job detail & jobs lists
            qc.invalidateQueries({ queryKey: ['customer-job', jobId] });
            qc.invalidateQueries({ queryKey: ['customer-jobs'] });
            qc.invalidateQueries({ queryKey: ['provider-pending-jobs'] });
        },
    });
}