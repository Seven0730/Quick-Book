import { useQuery } from '@tanstack/react-query';
import { fetcher }   from '../api';
import type { PriceGuidance } from '@/types';


export function useJobs(categoryId?: number) {
  return useQuery<PriceGuidance, Error>({
    queryKey:   ['jobs', 'price-guidance', categoryId],
    queryFn:    () =>
      fetcher<PriceGuidance>(`/jobs/price-guidance?categoryId=${categoryId}`),
    enabled:    Boolean(categoryId),
    staleTime:  1000 * 60 * 5,
  });
}
