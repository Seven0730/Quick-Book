'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useJob } from '@/hooks/customer/jobs';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import FlashOnIcon from '@mui/icons-material/FlashOn';

export default function CustomerQuickBookWaitingPage() {
    const jobId = Number(usePathname()!.split('/').pop());
    const { data: job, isLoading, error, refetch } = useJob(jobId);

    const [hydrated, setHydrated] = useState(false);
    useEffect(() => { setHydrated(true); }, []);

    const [remaining, setRemaining] = useState<number>(30);
    const toastShown = useRef<{error?: boolean; notFound?: boolean; destroyed?: boolean; booked?: boolean}>({});

    useEffect(() => {
        if (!hydrated) return;
        if (!job) return;
        const created = new Date(job.createdAt).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - created) / 1000);
        setRemaining(Math.max(0, 30 - elapsed));
    }, [job, hydrated]);

    useEffect(() => {
        if (!hydrated) return;
        if (remaining <= 0) return;
        const iv = setInterval(() => {
            setRemaining(r => {
                const nr = r - 1;
                return nr >= 0 ? nr : 0;
            });
        }, 1000);
        return () => clearInterval(iv);
    }, [remaining, hydrated]);

    useEffect(() => {
        if (!hydrated) return;
        if (remaining === 0) {
            refetch();
        }
    }, [remaining, refetch, hydrated]);

    useEffect(() => {
        if (!hydrated) return;
        const iv2 = setInterval(() => {
            refetch();
        }, 5000);
        return () => clearInterval(iv2);
    }, [refetch, hydrated]);

    useEffect(() => {
        if (!hydrated) return;
        if (error && !toastShown.current.error) {
            toast.error('Failed to load job.');
            toastShown.current.error = true;
        }
    }, [error, hydrated]);

    useEffect(() => {
        if (!hydrated) return;
        if (!job && !isLoading && !toastShown.current.notFound) {
            toast.error('Job not found.');
            toastShown.current.notFound = true;
        }
    }, [job, isLoading, hydrated]);

    useEffect(() => {
        if (!hydrated) return;
        if (job?.status === 'DESTROYED' && !toastShown.current.destroyed) {
            toast('No provider accepted your quick-book request in 30 seconds.');
            toastShown.current.destroyed = true;
        }
        if (job?.status === 'BOOKED' && !toastShown.current.booked) {
            toast.success('Your job has been accepted!');
            toastShown.current.booked = true;
        }
    }, [job, hydrated]);

    if (!hydrated) {
        return <div style={{ minHeight: 300 }} />;
    }

    if (isLoading) return <p>Checking status…</p>;
    if (error) return <p className="text-red-500">Error loading job</p>;
    if (!job) return <p>Job not found</p>;

    if (job.status === 'DESTROYED') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 py-8 flex items-center justify-center">
                <div className="max-w-md mx-auto p-6 bg-white/80 rounded-xl shadow-lg space-y-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-pink-500 animate-bounce">
                            <FlashOnIcon fontSize="large" />
                        </span>
                        <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-blue-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">⏰ Time’s up!</h2>
                    </div>
                    <p className="text-lg text-gray-700">No provider accepted your quick-book request in 30 seconds.</p>
                    <Link href="/customer/quick-book" className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-pink-400 via-blue-400 to-yellow-300 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200">
                        ← Back to Quick-Book
                    </Link>
                </div>
            </div>
        );
    }

    if (job.status === 'BOOKED') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 py-8 flex items-center justify-center">
                <div className="max-w-md mx-auto p-6 bg-white/80 rounded-xl shadow-lg space-y-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-green-500 animate-bounce">
                            <FlashOnIcon fontSize="large" />
                        </span>
                        <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 via-blue-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">🎉 Your job has been accepted!</h2>
                    </div>
                    <p className="text-lg text-gray-700">Provider #{job.acceptedById} is on their way.</p>
                    <Link href="/customer/quick-book" className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-pink-400 via-blue-400 to-yellow-300 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200">
                        ← Back to Quick-Book
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 py-8 flex items-center justify-center">
            <div className="max-w-md mx-auto p-6 bg-white/80 rounded-xl shadow-lg space-y-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-blue-500 animate-bounce">
                        <FlashOnIcon fontSize="large" />
                    </span>
                    <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">Waiting for a Provider…</h2>
                </div>
                <p className="text-lg text-gray-700">We’ve notified all providers within 5 km. They each have 30 s to accept.</p>
                <p className="text-2xl font-bold text-blue-700">
                    <span className={remaining <= 5 ? 'text-red-500 animate-pulse' : ''}>⏱ {remaining}s</span> remaining
                </p>
                <p className="text-lg text-gray-700">Status: <span className="font-bold">{job.status}</span></p>
            </div>
        </div>
    );
}
