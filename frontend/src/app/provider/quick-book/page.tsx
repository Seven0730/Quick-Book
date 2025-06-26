'use client';
import { useState, useEffect } from 'react';
import { usePendingJobs } from '@/hooks/provider/usePendingJobs';
import { useAppSocket } from '@/lib/hooks/useAppSocket';
import { useProviderContext } from '@/contexts/ProviderContext';
import type { Job } from '@/types';
import { fetcher } from '@/lib/api';

export default function ProviderQuickBookPage() {
    const { providerId, setProviderId } = useProviderContext();
    const { data: initial = [] } = usePendingJobs();
    const { socket, ready } = useAppSocket();
    const [jobs, setJobs] = useState(initial);

    useEffect(() => { setJobs(initial) }, [initial]);

    useEffect(() => {
        if (!socket || !ready) return;
        const onJob = (job: Job) => {
            if (job.status === 'PENDING') setJobs(prev => [job, ...prev]);
        };
        socket.on('new-job', onJob);
        return () => { socket.off('new-job', onJob); };
    }, [socket, ready]);

    // when someone books it, remove from list
    useEffect(() => {
        if (!socket || !ready) return;
        const onBooked = (updated: Job) => {
            setJobs(prev => prev.filter(j => j.id !== updated.id));
        };
        const onDestroyed = ({ jobId }: { jobId: number }) => {
            setJobs(prev => prev.filter(j => j.id !== jobId));
        };
        socket.on('job-destroyed', onDestroyed);
        socket.on('job-booked', onBooked);
        return () => {
            socket.off('job-booked', onBooked);
            socket.off('job-destroyed', onDestroyed);
        };
    }, [socket, ready]);

    if (providerId == null) {
        return (
            <div className="p-4">
                <h1>Enter Provider ID</h1>
                <input
                    type="number"
                    onKeyDown={e => {
                        if (e.key === 'Enter') setProviderId(Number((e.target as any).value));
                    }}
                    className="border p-2 rounded"
                />
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-4 space-y-4">
            <h1 className="text-2xl font-bold">Quick-Book Dashboard</h1>
            {jobs.map(job => (
                <QuickBookCard key={job.id} job={job} />
            ))}
        </div>
    );
}

export function QuickBookCard({ job }: { job: Job }) {
    const { socket, ready } = useAppSocket();
    const { providerId } = useProviderContext();
    const [timer, setTimer] = useState(30);
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        if (hidden) return;
        const iv = setInterval(() => setTimer(t => t - 1), 1000);
        return () => clearInterval(iv);
    }, [hidden]);

    async function accept() {
        if (!providerId) return;
        try {
            await fetcher<Job>(`/jobs/${job.id}/accept`, {
                method: 'POST',
                headers: { 'x-provider-id': String(providerId) },
            });
            setHidden(true);
        } catch (err: any) {
            alert(`Accept failed: ${err.message}`);
        }
    }

    function decline() {
        setHidden(true);
        socket?.emit('decline', job.id);
    }

    if (hidden) return null;

    return (
        <div className="border p-4 rounded bg-yellow-50 space-y-2">
            <div className="flex justify-between items-center">
                <span>Job #{job.id}</span>
                <span>⏱ {timer}s</span>
            </div>
            <p>Category: {job.categoryId}</p>
            <p>Price: ${job.price.toFixed(2)}</p>
            <p>Timeslot: {job.timeslot}</p>

            <div className="flex space-x-2">
                <button
                    onClick={accept}
                    disabled={timer <= 0}
                    className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
                >
                    Accept
                </button>
                <button
                    onClick={decline}
                    disabled={timer <= 0}
                    className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
                >
                    Decline
                </button>
            </div>
        </div>
    );
}
