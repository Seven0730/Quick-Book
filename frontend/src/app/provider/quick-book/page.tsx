'use client';
import { useState, useEffect } from 'react';
import { usePendingJobs } from '@/hooks/provider/usePendingJobs';
import { useAppSocket } from '@/lib/hooks/useAppSocket';
import { useProviderContext } from '@/contexts/ProviderContext';
import type { Job } from '@/types';
import { QuickBookCard } from '@/components/QuickBookCard';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { ProviderIdInput } from '@/components/ProviderIdInput';
import { useRouter } from 'next/navigation';

export default function ProviderQuickBookPage() {
    const { providerId, setProviderId } = useProviderContext();
    const router = useRouter();
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

    useEffect(() => {
        if (providerId == null) {
            router.replace('/provider/login');
        }
    }, [providerId, router]);
    if (providerId == null) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 py-8">
            <div className="max-w-md mx-auto p-4 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-pink-500 animate-bounce">
                        <FlashOnIcon fontSize="large" />
                    </span>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-blue-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">Quick-Book</h1>
                </div>
                <div className="space-y-4">
                    {jobs.map(job => (
                        <QuickBookCard key={job.id} job={job} />
                    ))}
                </div>
            </div>
        </div>
    );
}

