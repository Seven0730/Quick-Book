'use client';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useJob } from '@/hooks/customer/jobs';
import { usePostBid } from '@/hooks/provider/usePostBid';
import { useProviderContext } from '@/contexts/ProviderContext';
import { toast } from 'react-hot-toast';

export default function ProviderJobDetailPage() {
    const path = usePathname()!;
    const jobId = Number(path.split('/').pop());
    const { providerId, setProviderId } = useProviderContext();

    const { data: job, isLoading, error } = useJob(jobId);
    const postBid = usePostBid();
    const [price, setPrice] = useState(0);
    const [note, setNote] = useState('');
    const toastShown = useRef<{error?: boolean; notFound?: boolean}>({});

    useEffect(() => {
        if (error && !toastShown.current.error) {
            toast.error('Failed to load job.');
            toastShown.current.error = true;
        }
    }, [error]);

    useEffect(() => {
        if (!job && !isLoading && !toastShown.current.notFound) {
            toast.error('Job not found.');
            toastShown.current.notFound = true;
        }
    }, [job, isLoading]);

    function handleSubmitBid() {
        if (price <= 0 || providerId == null) return;
        toast.loading('Submitting bid...');
        postBid.mutate(
            { jobId, providerId, price, note },
            {
                onSuccess: (bid) => {
                    toast.dismiss();
                    toast.success(`Bid #${bid.id} submitted successfully!`);
                    setPrice(0);
                    setNote('');
                },
                onError: (err) => {
                    toast.dismiss();
                    toast.error(`Failed to submit bid: ${err.message}`);
                },
            }
        );
    }

    if (providerId == null) {
        return (
            <div className="max-w-sm mx-auto p-4 space-y-4">
                <h1 className="text-xl font-bold">Provider Login</h1>
                <input
                    type="number"
                    placeholder="Enter your providerId"
                    className="w-full border p-2 rounded"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const val = Number((e.target as HTMLInputElement).value);
                            if (!isNaN(val)) setProviderId(val);
                        }
                    }}
                />
                <p className="text-sm text-gray-600">Press Enter to connect</p>
            </div>
        );
    }

    if (isLoading) return <p>Loading job…</p>;
    if (error || !job) return <p className="text-red-500">Job not found</p>;

    return (
        <div className="max-w-md space-y-4">
            <h1 className="text-2xl font-bold">Job #{job.id}</h1>
            <p>Category: {job.categoryId}</p>
            <p>Price guideline: ${job.price.toFixed(2)}</p>
            <p>Timeslot: {job.timeslot}</p>

            <div className="space-y-2">
                <input
                    type="number"
                    placeholder="Your bid price"
                    className="border p-1 rounded w-full"
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                />
                <input
                    type="text"
                    placeholder="Note (optional)"
                    className="border p-1 rounded w-full"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                />
                <button
                    disabled={postBid.isPending || price <= 0}
                    onClick={handleSubmitBid}
                    className="w-full py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                    {postBid.isPending ? 'Submitting…' : 'Submit Bid'}
                </button>
            </div>
        </div>
    );
}
