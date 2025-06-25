'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@/lib/api';
import { CategorySelect } from '@/components/CategorySelect';
import { PriceSlider } from '@/components/PriceSlider';
import { TimeslotPicker } from '@/components/TimeslotPicker';
import type { Job } from '@/types';

export default function CustomerCreateJobPage() {
    const router = useRouter();
    const qc = useQueryClient();

    const [catId, setCatId] = useState<number>();
    const [price, setPrice] = useState<number>(0);
    const [slot, setSlot] = useState<string>();
    const [error, setError] = useState<string>();

    // stubbed customer location
    const customerLat = 1.3521;
    const customerLon = 103.8198;

    const canSubmit = Boolean(catId && price > 0 && slot);

    const mutation = useMutation<Job, Error, {
        categoryId: number;
        price: number;
        timeslot: string;
        customerLat: number;
        customerLon: number;
    }>({
        mutationFn: (data) =>
            fetcher<Job>('/jobs', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['customer-jobs'] });
            router.push('/customer');
        },
        onError: (err) => setError(err.message),
    });

    return (
        <div className="space-y-6 max-w-md">
            <h1 className="text-2xl font-bold">Quick Book</h1>

            <div>
                <label className="block mb-1">1. Service Category</label>
                <CategorySelect value={catId} onChange={setCatId} />
            </div>

            <div>
                <label className="block mb-1">2. Your Price</label>
                <PriceSlider
                    categoryId={catId}
                    value={price}
                    onChange={setPrice}
                />
            </div>

            <div>
                <label className="block mb-1">3. Arrival Window</label>
                <TimeslotPicker value={slot} onChange={setSlot} />
            </div>

            <button
                disabled={!canSubmit || mutation.isPending}
                onClick={() =>
                    mutation.mutate({ categoryId: catId!, price, timeslot: slot!, customerLat, customerLon })
                }
                className="w-full py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
                {mutation.isPending ? 'Submitting…' : 'Confirm'}
            </button>

            {error && <p className="text-red-500">{error}</p>}
        </div>
    );
}
