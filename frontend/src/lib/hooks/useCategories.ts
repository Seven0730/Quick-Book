import { useQuery } from '@tanstack/react-query';
import type { Category } from '@/types';
import { fetcher } from '../api';

export function useCategories() {
  return useQuery<Category[], Error>({
    queryKey:   ['categories'],
    queryFn:    () => fetcher<Category[]>('/categories'),
    staleTime:  1000 * 60 * 5,
  });
}