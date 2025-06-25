import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher }                    from '@/lib/api';
import type { Bid }                   from '@/types';

interface PostBidPayload {
  jobId:      number;
  providerId: number;
  price:      number;
  note?:      string;
}

export function usePostBid() {
  const qc = useQueryClient();
  return useMutation<Bid, Error, PostBidPayload>({
    mutationFn: async ({ jobId, providerId, price, note }) => {
      return fetcher<Bid>(`/jobs/${jobId}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'x-provider-id': String(providerId),
        },
        body: JSON.stringify({ providerId, price, note }),
      });
    },
    onSuccess: (_, { jobId }) => {
      qc.invalidateQueries({ queryKey: ['provider-pending-jobs'] });
      qc.invalidateQueries({ queryKey: ['customer-job-bids', jobId] });
    },
  });
}
