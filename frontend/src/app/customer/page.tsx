'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useJobs } from '@/hooks/customer/jobs';
import { useAppSocket } from '@/lib/hooks/useAppSocket';
import type { Job } from '@/types';

export default function CustomerJobsPage() {
    const { data: initialJobs = [], isLoading, error, refetch } = useJobs();
    const { socket, ready } = useAppSocket();

    const [jobs, setJobs] = useState<Job[]>(initialJobs);

    useEffect(() => {
        setJobs(initialJobs);
    }, [initialJobs]);

    useEffect(() => {
        if (!socket || !ready) return;

        const onBooked = (job: Job) => {
            setJobs(prev =>
                prev.map(j => (j.id === job.id ? { ...j, status: 'BOOKED' } : j))
            );
        };
        const onCancelled = (payload: { jobId: number }) => {
            setJobs(prev =>
                prev.map(j => (j.id === payload.jobId ? { ...j, status: 'CANCELLED_BY_PROVIDER' } : j))
            );
        };
        const onDestroyed = ({ jobId }: { jobId: number }) => {
            setJobs(prev => prev.filter(j => j.id !== jobId));
        };

        socket.on('job-booked', onBooked);
        socket.on('job-cancelled', onCancelled);
        socket.on('job-destroyed', onDestroyed);

        return () => {
            socket.off('job-booked', onBooked);
            socket.off('job-cancelled', onCancelled);
            socket.off('job-destroyed', onDestroyed);
        };
    }, [socket, ready]);

    if (isLoading) return <p>Loading your jobs…</p>;
    if (error) return <p className="text-red-500">Error: {error.message}</p>;
    if (jobs.length === 0) return <p>No jobs yet.</p>;

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">My Jobs</h1>
            <ul className="divide-y">
                {jobs.map(job => (
                    <li key={job.id} className="py-2 flex justify-between items-center">
                        <Link href={`/customer/${job.id}`} className="text-blue-600 hover:underline">
                            Job #{job.id}
                        </Link>
                        <span className={`px-2 py-0.5 rounded 
              ${job.status === 'PENDING' ? 'bg-yellow-200' :
                                job.status === 'BOOKED' ? 'bg-green-200' :
                                    'bg-red-200'}`}>
                            {job.status}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
