'use client';
import { useCategories } from '@/lib/hooks/useCategories';
import type { Category } from '@/types';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

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
        <FormControl fullWidth sx={{ my: 1 }}>
            <InputLabel id="category-select-label" sx={{
                background: 'linear-gradient(90deg,#f472b6,#60a5fa,#fde68a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
                pl: 1
            }}>{placeholder ?? 'Select a category'}</InputLabel>
            <Select
                labelId="category-select-label"
                value={value ?? ''}
                label={placeholder ?? 'Select a category'}
                onChange={e => onChange?.(Number(e.target.value))}
                sx={{
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.85)',
                    boxShadow: 2,
                    '& .MuiSelect-select': {
                        py: 2,
                        px: 2,
                        fontWeight: 600,
                        color: '#374151',
                    },
                    '& fieldset': {
                        borderColor: '#f472b6',
                    },
                    '&:hover fieldset': {
                        borderColor: '#60a5fa',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#fde68a',
                    },
                }}
            >
                <MenuItem value="">
                    <em>{placeholder ?? 'Select a category'}</em>
                </MenuItem>
                {data!.map((cat: Category) => (
                    <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
