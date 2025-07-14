'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useJob } from '@/hooks/customer/jobs';
import { useTopBids } from '@/hooks/customer/useTopBids';
import { fetcher } from '@/lib/api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import type { Bid, Job } from '@/types';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import GroupIcon from '@mui/icons-material/Group';

export default function CustomerJobDetailPage() {
    const id = Number(usePathname()!.split('/').pop());
    const { data: job, isLoading, error, refetch: refetchJob } = useJob(id);
    const { data: bids = [], refetch: refetchBids } = useTopBids(id);
    const toastShown = useRef<{error?: boolean; notFound?: boolean}>({});

    useEffect(() => {
        const iv1 = setInterval(() => refetchJob(), 10_000);
        const iv2 = setInterval(() => refetchBids(), 10_000);
        return () => { clearInterval(iv1); clearInterval(iv2); };
    }, [refetchJob, refetchBids]);

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

    if (isLoading) return <p>Loading…</p>;
    if (error) return <p className="text-red-500">Error: {error.message}</p>;
    if (!job) return <p>Job not found</p>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 py-8">
            <div className="max-w-md mx-auto p-4 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-pink-500 animate-bounce">
                        <AssignmentTurnedInIcon fontSize="large" />
                    </span>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-blue-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">Job #{job.id} Details</h1>
                </div>
                <div className="bg-white/80 rounded-xl shadow-lg p-6 space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <MonetizationOnIcon className="text-yellow-500" />
                        <span>Accept Price:</span>
                        <span className="text-gray-700">${job.acceptPrice?.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <AssignmentTurnedInIcon className="text-green-500" />
                        <span>Status:</span>
                        <span className="text-gray-700">{job.status}</span>
                    </div>
                </div>
                {job.status === 'BOOKED' ? (
                    <div className="p-4 bg-green-100 rounded-xl shadow flex items-center gap-2 font-bold text-green-800">
                        🎉 Provider #{job.acceptedById} @ ${job.price.toFixed(2)}
                    </div>
                ) : job.status === 'CANCELLED_BY_PROVIDER' ? (
                    <div className="p-4 bg-red-100 rounded-xl shadow flex items-center gap-2 font-bold text-red-700">
                        ❌ This job was cancelled by the provider.
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mt-6 mb-2">
                            <span className="text-blue-400 animate-bounce">
                                <GroupIcon fontSize="medium" />
                            </span>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent drop-shadow">Live Top 3 Quotes</h2>
                        </div>
                        {bids.slice(0, 3).map((b: Bid) => (
                            <div key={b.id} className="flex justify-between items-center bg-white/80 border border-pink-100 rounded-xl shadow p-4">
                                <div>
                                    <p className="font-semibold text-blue-600">Provider #{b.providerId}</p>
                                    <p className="text-yellow-700 font-bold">${b.price.toFixed(2)}</p>
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
                                    className="px-4 py-2 bg-gradient-to-r from-green-400 via-blue-400 to-yellow-300 text-white font-bold rounded-xl shadow hover:scale-105 hover:shadow-2xl transition-all duration-200"
                                >
                                    Accept
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <Link
                    href="/customer/history"
                    className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-pink-400 via-blue-400 to-yellow-300 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200"
                >
                    ← Back to History
                </Link>
            </div>
        </div>
    );
}
