'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useJob } from '@/hooks/customer/jobs';
import Link from 'next/link';

export default function CustomerQuickBookWaitingPage() {
    const jobId = Number(usePathname()!.split('/').pop());
    const { data: job, isLoading, error, refetch } = useJob(jobId);

    const [remaining, setRemaining] = useState<number>(30);
    useEffect(() => {
        if (!job) return;
        const created = new Date(job.createdAt).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - created) / 1000);
        setRemaining(Math.max(0, 30 - elapsed));
    }, [job]);

    useEffect(() => {
        if (remaining <= 0) return;
        const iv = setInterval(() => {
            setRemaining(r => {
                const nr = r - 1;
                return nr >= 0 ? nr : 0;
            });
        }, 1000);
        return () => clearInterval(iv);
    }, [remaining]);

    useEffect(() => {
        if (remaining === 0) {
            refetch();
        }
    }, [remaining, refetch]);

    useEffect(() => {
        const iv2 = setInterval(() => {
            refetch();
        }, 5000);
        return () => clearInterval(iv2);
    }, [refetch]);

    if (isLoading) return <p>Checking status…</p>;
    if (error) return <p className="text-red-500">Error loading job</p>;
    if (!job) return <p>Job not found</p>;

    if (job.status === 'DESTROYED') {
        return (
            <div className="max-w-md mx-auto p-4 space-y-4">
                <h2 className="text-xl font-bold">⏰ Time’s up!</h2>
                <p>No provider accepted your quick-book request in 30 seconds.</p>
                <Link href="/customer/quick-book" className="text-blue-600 hover:underline">
                    ← Back to Quick-Book
                </Link>
            </div>
        );
    }

    if (job.status === 'BOOKED') {
        return (
            <div className="max-w-md mx-auto p-4 space-y-4">
                <h2 className="text-xl font-bold">🎉 Your job has been accepted!</h2>
                <p>Provider #{job.acceptedById} is on their way.</p>
                <Link href="/customer/quick-book" className="text-blue-600 hover:underline">
                    ← Back to Quick-Book
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-4 space-y-4">
            <h2 className="text-xl font-bold">Waiting for a Provider…</h2>
            <p>We’ve notified all providers within 5 km. They each have 30 s to accept.</p>
            <p>
                <strong>⏱ {remaining}s</strong> remaining
            </p>
            <p>Status: {job.status}</p>
        </div>
    );
}
