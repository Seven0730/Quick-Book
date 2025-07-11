'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useJob } from '@/hooks/customer/jobs';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function CustomerQuickBookWaitingPage() {
    const jobId = Number(usePathname()!.split('/').pop());
    const { data: job, isLoading, error, refetch } = useJob(jobId);

    const [remaining, setRemaining] = useState<number>(30);
    const toastShown = useRef<{error?: boolean; notFound?: boolean; destroyed?: boolean; booked?: boolean}>({});

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

    useEffect(() => {
        if (job?.status === 'DESTROYED' && !toastShown.current.destroyed) {
            toast('No provider accepted your quick-book request in 30 seconds.');
            toastShown.current.destroyed = true;
        }
        if (job?.status === 'BOOKED' && !toastShown.current.booked) {
            toast.success('Your job has been accepted!');
            toastShown.current.booked = true;
        }
    }, [job]);

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
