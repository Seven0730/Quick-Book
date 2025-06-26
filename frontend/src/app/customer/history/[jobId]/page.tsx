'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useJob } from '@/hooks/customer/jobs';
import { useTopBids } from '@/hooks/customer/useTopBids';
import { fetcher } from '@/lib/api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import type { Bid, Job } from '@/types';

export default function CustomerJobDetailPage() {
    const id = Number(usePathname()!.split('/').pop());
    const { data: job, isLoading, error, refetch: refetchJob } = useJob(id);
    const { data: bids = [], refetch: refetchBids } = useTopBids(id);

    useEffect(() => {
        const iv1 = setInterval(() => refetchJob(), 10_000);
        const iv2 = setInterval(() => refetchBids(), 10_000);
        return () => { clearInterval(iv1); clearInterval(iv2); };
    }, [refetchJob, refetchBids]);

    if (isLoading) return <p>Loading…</p>;
    if (error) return <p className="text-red-500">Error: {error.message}</p>;
    if (!job) return <p>Job not found</p>;

    return (
        <div className="max-w-md mx-auto p-4 space-y-4">
            <h1 className="text-2xl font-bold">Job #{job.id}</h1>
            <p>Accept Price: ${job.acceptPrice?.toFixed(2)}</p>
            <p>Status: {job.status}</p>

            {job.status === 'BOOKED' ? (
                <div className="p-4 bg-green-50 rounded">
                    🎉 Provider #{job.acceptedById} @ ${job.price.toFixed(2)}
                </div>
            ) : job.status === 'CANCELLED_BY_PROVIDER' ? (
                <div className="p-4 bg-red-50 rounded">
                    ❌ This job was cancelled by the provider.
                </div>
            ) : (
                <div className="space-y-3">
                    <h2 className="text-lg font-medium">Live Top 3 Quotes</h2>
                    {bids.slice(0, 3).map((b: Bid) => (
                        <div key={b.id} className="flex justify-between items-center border p-2 rounded">
                            <div>
                                <p>Provider #{b.providerId}</p>
                                <p>${b.price.toFixed(2)}</p>
                                <p className="text-sm text-gray-600">{b.note}</p>
                            </div>
                            <button
                                onClick={async () => {
                                    try {
                                        await fetcher<Job>(
                                            `/jobs/${id}/bids/${b.id}/select`,
                                            {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({}),
                                            }
                                        );
                                        toast.success('You hired this provider! 🎉');
                                        refetchJob();
                                    } catch (e: any) {
                                        toast.error(`Accept failed: ${e.message}`);
                                    }
                                }}
                                className="px-3 py-1 bg-green-600 text-white rounded"
                            >
                                Accept
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <Link
                href="/customer/history"
                className="inline-block mt-4 text-blue-600 hover:underline"
            >
                ← Back to History
            </Link>
        </div>
    );
}
