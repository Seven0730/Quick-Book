'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useJob, useJobBids } from '@/hooks/customer/jobs';
import { JobStatusToast } from '@/components/JobStatusToast';
import Link from 'next/link';

export default function CustomerJobDetailPage() {
    const router = useRouter();
    const path = usePathname()!;
    const jobId = Number(path.split('/').pop());

    const { data: job, isLoading, error } = useJob(jobId);
    const { data: bids, isLoading: bidsLoading } = useJobBids(jobId);

    if (isLoading) return <p>Loading job…</p>;
    if (error || !job) return <p className="text-red-500">Job not found</p>;

    return (
        <div className="space-y-4 max-w-md">
            <JobStatusToast jobId={jobId} />

            <h1 className="text-2xl font-bold">Job #{job.id}</h1>
            <p>Category: {job.categoryId}</p>
            <p>Price: ${job.price.toFixed(2)}</p>
            <p>Time slot: {job.timeslot}</p>
            <p>Status: {job.status}</p>

            <h2 className="mt-6 text-xl font-semibold">Bids</h2>
            {bidsLoading && <p>Loading bids…</p>}
            {bids && bids.length === 0 && <p>No bids yet.</p>}
            {bids && bids.length > 0 && (
                <ul className="divide-y">
                    {bids.map(b => (
                        <li key={b.id} className="py-2">
                            <p>Provider #{b.providerId} – ${b.price.toFixed(2)}</p>
                            <p className="text-gray-600 text-sm">{b.note}</p>
                        </li>
                    ))}
                </ul>
            )}

            <Link
                href="/customer"
                className="inline-block mt-4 text-blue-600 hover:underline"
            >
                ← Back to My Jobs
            </Link>
        </div>
    );
}
