'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePostJob } from '@/hooks/customer/usePostJob';
import { toast } from 'react-hot-toast';
import { CategorySelect } from '@/components/CategorySelect';
import { PriceSlider } from '@/components/PriceSlider';
import { TimeslotPicker } from '@/components/TimeslotPicker';

export default function CustomerCreateJobPage() {
    const router = useRouter();
    const [catId, setCatId] = useState<number>();
    const [price, setPrice] = useState<number>(0);
    const [slot, setSlot] = useState<string>();

    // stubbed customer location
    const customerLat = 1.3521;
    const customerLon = 103.8198;

    const canSubmit = Boolean(catId && price > 0 && slot);

    const postJob = usePostJob();

    function handleSubmit() {
        if (!canSubmit) return;
        toast.loading('Creating job...');
        postJob.mutate(
            { categoryId: catId!, price, timeslot: slot!, customerLat, customerLon },
            {
                onSuccess: (job) => {
                    toast.dismiss();
                    toast.success(`Job #${job.id} created successfully!`);
                    router.push('/customer');
                },
                onError: (err) => {
                    toast.dismiss();
                    toast.error(`Failed to create job: ${err.message}`);
                },
            }
        );
    }

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
                disabled={!canSubmit || postJob.isPending}
                onClick={handleSubmit}
                className="w-full py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
                {postJob.isPending ? 'Submitting…' : 'Confirm'}
            </button>
        </div>
    );
}
