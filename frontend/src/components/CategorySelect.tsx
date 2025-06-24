'use client';
import { useCategories } from '@/lib/hooks/useCategories';
import type { Category } from '@/types';

interface Props {
    value?: number;
    onChange?: (categoryId: number) => void;
    placeholder?: string;
}

export function CategorySelect({ value, onChange, placeholder }: Props) {
    const { data, isLoading, error } = useCategories();

    if (isLoading) return <p>Loading categories…</p>;
    if (error) return <p className="text-red-500">Error: {error.message}</p>;

    return (
        <select
            className="border p-2 rounded"
            value={value ?? ''}
            onChange={(e) => onChange?.(Number(e.target.value))}
        >
            <option value="">{placeholder ?? 'Select a category'}</option>
            {data!.map((cat: Category) => (
                <option key={cat.id} value={cat.id}>
                    {cat.name}
                </option>
            ))}
        </select>
    );
}
