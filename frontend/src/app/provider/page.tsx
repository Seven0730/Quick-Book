'use client';
import { useState, useEffect } from 'react';
import type { Job } from '@/types';
import { usePendingJobs } from '@/hooks/provider/usePendingJobs';
import { usePostBid } from '@/hooks/provider/usePostBid';
import { useAppSocket } from '@/lib/hooks/useAppSocket';
import { useProviderContext } from '@/contexts/ProviderContext';

export default function ProviderDashboardPage() {
    const { providerId, setProviderId } = useProviderContext();
    const { data: initialJobs = [], isLoading, error, refetch } = usePendingJobs();
    const postBidMutation = usePostBid();
    const { socket, ready } = useAppSocket();

    const [jobs, setJobs] = useState<Job[]>(initialJobs);

    useEffect(() => {
        setJobs(initialJobs);
    }, [initialJobs]);

    // Subscribe to new-job events
    useEffect(() => {
        if (!socket || !ready) return;
        const onNewJob = (job: Job) => {
            if (job.status !== 'PENDING') return;
            setJobs(prev => {
                if (prev.some(j => j.id === job.id)) {
                    return prev;
                }
                return [job, ...prev];
            });
        };
        socket.on('new-job', onNewJob);
        return () => {
            socket.off('new-job', onNewJob);
        };
    }, [socket, ready]);

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

    if (isLoading) return <p>Loading jobs…</p>;
    if (error) return <p className="text-red-500">Error: {error.message}</p>;
    if (jobs.length === 0) return <p>No pending jobs.</p>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Provider Dashboard</h1>
            {jobs.map((job) => (
                <JobBidForm
                    key={job.id}
                    job={job}
                    isSubmitting={postBidMutation.isPending}
                    onSubmit={(price, note) =>
                        postBidMutation.mutate({ jobId: job.id, providerId, price, note })
                    }
                />
            ))}
        </div>
    );
}

function JobBidForm({
    job,
    isSubmitting,
    onSubmit,
}: {
    job: Job;
    isSubmitting: boolean;
    onSubmit: (price: number, note?: string) => void;
}) {
    const [price, setPrice] = useState(0);
    const [note, setNote] = useState('');

    return (
        <div className="border p-4 rounded space-y-2">
            <p>
                <strong>Job #{job.id}</strong> — ${job.price.toFixed(2)} —{' '}
                {job.timeslot}
            </p>

            <div className="flex space-x-2">
                <input
                    type="number"
                    className="border p-1 rounded w-24"
                    placeholder="Bid price"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                />
                <input
                    type="text"
                    className="border p-1 rounded flex-1"
                    placeholder="Note (optional)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
                <button
                    disabled={isSubmitting || price <= 0}
                    onClick={() => onSubmit(price, note)}
                    className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                    {isSubmitting ? 'Submitting…' : 'Bid'}
                </button>
            </div>
        </div>
    );
}
