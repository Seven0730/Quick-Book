'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useJob } from '@/hooks/customer/jobs';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function CustomerPostQuoteAcceptedPage() {
    const router = useRouter();
    const jobId = Number(usePathname()!.split('/').pop());
    const { data: job, isLoading, error } = useJob(jobId);
    const toastShown = useRef<{error?: boolean; notFound?: boolean}>({});

    // if someone lands here early, bounce back
    useEffect(() => {
        if (!isLoading && job?.status !== 'BOOKED') {
            router.replace(`/customer/post-quote/${jobId}`);
        }
    }, [isLoading, job, jobId, router]);

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
    if (error) return <p className="text-red-500">Error loading job</p>;
    if (!job) return <p>Job not found</p>;

    return (
        <div className="max-w-md mx-auto p-4 space-y-4">
            <h1 className="text-2xl font-bold">Job #{job.id} Hired!</h1>
            <p>
                You’ve hired <strong>Provider #{job.acceptedById}</strong> for ${job.price.toFixed(2)}.
            </p>
            <Link
                href="/customer/post-quote"
                className="text-blue-600 hover:underline"
            >
                ← Back to Post & Quote
            </Link>
        </div>
    );
}
