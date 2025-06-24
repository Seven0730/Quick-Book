'use client';
import { useState, useEffect } from 'react';
import { useJobs } from '@/lib/hooks/useJobs';

interface Props {
    categoryId?: number;
    value?: number;
    onChange?: (price: number) => void;
}

export function PriceSlider({ categoryId, value, onChange }: Props) {
    const { data, isLoading, error } = useJobs(categoryId);
    const [price, setPrice] = useState<number>(value ?? 0);

    useEffect(() => {
        if (data && value == null) {
            setPrice(data.p50);
            onChange?.(data.p50);
        }
    }, [data, value, onChange]);

    if (!categoryId) return <p className="text-gray-500">Select a category first.</p>;
    if (isLoading) return <p>Loading price guidance…</p>;
    if (error) return <p className="text-red-500">Error: {error.message}</p>;
    if (!data) {
        return null;
    }

    return (
        <div className="space-y-2">
            <label htmlFor="price-slider" className="block">Set your price: ${price.toFixed(2)}</label>
            <input
                id="price-slider"
                type="range"
                min={data.p10}
                max={data.p90}
                step="0.01"
                value={price}
                onChange={(e) => {
                    const v = Number(e.target.value);
                    setPrice(v);
                    onChange?.(v);
                }}
                className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
                <span>${data.p10.toFixed(2)}</span>
                <span>median ${data.p50.toFixed(2)}</span>
                <span>${data.p90.toFixed(2)}</span>
            </div>
        </div>
    );
}
