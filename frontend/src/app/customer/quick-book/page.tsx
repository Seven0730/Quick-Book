'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCategories } from '@/hooks/customer/useCategories';
import { usePriceGuidance } from '@/hooks/customer/usePriceGuidance';
import { fetcher } from '@/lib/api';
import { TimeslotPicker } from '@/components/TimeslotPicker';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import type { Job } from '@/types';

export default function CustomerQuickBookPage() {
    const router = useRouter();
    const qc = useQueryClient();

    const { data: cats = [] } = useCategories();
    const [catId, setCatId] = useState<number>();
    const priceGuidance = usePriceGuidance(catId);

    // suggested ±10% around median
    const median = priceGuidance.data?.p50 ?? 0;
    const low = +(median * 0.9).toFixed(2);
    const high = +(median * 1.1).toFixed(2);

    const [price, setPrice] = useState<number>(median);
    const [timeslot, setSlot] = useState<string>();

    // enable submit only when all fields set
    const canSubmit = !!catId && price > 0 && !!timeslot;

    async function handleConfirm() {
        if (!canSubmit) return;
        toast.loading('Creating quick-book job...');
        try {
            const job = await fetcher<Job>('/jobs', {
                method: 'POST',
                body: JSON.stringify({
                    categoryId: catId,
                    price,
                    timeslot,
                    // you might pull actual coords from browser geolocation
                    customerLat: 1.3521,
                    customerLon: 103.8198,
                }),
            });
            toast.dismiss();
            toast.success(`Quick-book job #${job.id} created successfully!`);
            // refresh customer jobs list
            qc.invalidateQueries({ queryKey: ['customer-jobs'] });
            router.push(`/customer/quick-book/${job.id}`);
        } catch (e: any) {
            toast.dismiss();
            toast.error(`Failed to create job: ${e.message}`);
        }
    }

    return (
        <div className="max-w-md mx-auto space-y-6 p-4">
            <h1 className="text-2xl font-bold">Quick-Book a Service</h1>

            <div>
                <label className="block mb-1 font-medium">Category</label>
                <select
                    className="w-full border p-2 rounded"
                    onChange={e => setCatId(Number(e.target.value))}
                >
                    <option value="">Select category</option>
                    {cats.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {catId && (
                <div>
                    <p className="text-sm text-gray-600">
                        Suggestion: ${median.toFixed(2)} &plusmn;10% ({low.toFixed(2)}–{high.toFixed(2)})
                    </p>
                    <input
                        type="number"
                        className="w-full border p-2 rounded mt-1"
                        value={price}
                        min={low}
                        max={high}
                        step={0.01}
                        onChange={e => setPrice(Number(e.target.value))}
                    />
                </div>
            )}

            <div>
                <label className="block mb-1 font-medium">Arrival Window</label>
                <TimeslotPicker value={timeslot} onChange={setSlot} />
            </div>

            <button
                disabled={!canSubmit}
                onClick={handleConfirm}
                className="w-full py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
                Confirm
            </button>
        </div>
    );
}
