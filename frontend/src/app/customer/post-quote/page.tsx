'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCategories } from '@/hooks/customer/useCategories';
import { usePostJob, PostJobPayload } from '@/hooks/customer/usePostJob';
import { TimeslotPicker } from '@/components/TimeslotPicker';

export default function CustomerPostQuotePage() {
    const router = useRouter();
    const { data: cats = [] } = useCategories();
    const postJob = usePostJob();

    const [categoryId, setCategoryId] = useState<number>();
    const [acceptPrice, setAcceptPrice] = useState<number>(0);
    const [timeslot, setTimeslot] = useState('');

    const canSubmit = !!categoryId && !!timeslot && acceptPrice > 0;

    function handleSubmit() {
        if (!canSubmit) return;
        const payload: PostJobPayload = {
            categoryId: categoryId!,
            acceptPrice,
            timeslot,
            customerLat: 1.3521,
            customerLon: 103.8198,
        };
        postJob.mutate(payload, {
            onSuccess: (job) => {
                router.push(`/customer/post-quote/${job.id}`);
            }
        });
    }

    return (
        <div className="max-w-md mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-bold">Post & Quote</h1>

            <div>
                <label>Category</label>
                <select
                    className="w-full border p-2 rounded"
                    onChange={e => setCategoryId(Number(e.target.value))}
                >
                    <option value="">Select…</option>
                    {cats.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label>Accept Price ($)</label>
                <input
                    type="number"
                    className="w-full border p-2 rounded"
                    value={acceptPrice}
                    onChange={e => setAcceptPrice(Number(e.target.value))}
                />
            </div>

            <div>
                <label>Timeslot</label>
                <TimeslotPicker value={timeslot} onChange={setTimeslot} />
            </div>

            <button
                disabled={!canSubmit}
                onClick={handleSubmit}
                className="w-full py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
                Post Job
            </button>
        </div>
    );
}
