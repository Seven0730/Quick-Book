import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/api';
import type { Category } from '@/types';

export function useCategories() {
    return useQuery<Category[], Error>({
        queryKey: ['categories'],
        queryFn: () => fetcher('/categories'),
    });
}
