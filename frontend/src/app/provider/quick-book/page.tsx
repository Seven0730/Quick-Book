'use client';
import { useState, useEffect } from 'react';
import { usePendingJobs } from '@/hooks/provider/usePendingJobs';
import { useAppSocket } from '@/lib/hooks/useAppSocket';
import { useProviderContext } from '@/contexts/ProviderContext';
import type { Job } from '@/types';
import { QuickBookCard } from '@/components/QuickBookCard';

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

    return (
        <div className="max-w-md mx-auto p-4 space-y-4">
            <h1 className="text-2xl font-bold">Quick-Book Dashboard</h1>
            {jobs.map(job => (
                <QuickBookCard key={job.id} job={job} />
            ))}
        </div>
    );
}

