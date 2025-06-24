import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher }                     from '../api';
import type { Job }                    from '@/types';

interface PostPayload {
  categoryId:   number;
  description:  string;
  acceptPrice?: number;
  customerLat:  number;
  customerLon:  number;
}

export function usePostJob() {
  const qc = useQueryClient();

  return useMutation<Job, Error, PostPayload>({
    // <-- annotate payload here
    mutationFn: async (payload: PostPayload) => {
      return fetcher<Job>('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          categoryId:  payload.categoryId,
          description: payload.description,
          acceptPrice: payload.acceptPrice,
          // Quick‐Book reuses price/timeslot; Post&Quote stubs them
          price:       payload.acceptPrice ?? 0,
          timeslot:    '',
          customerLat: payload.customerLat,
          customerLon: payload.customerLon,
        }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}
