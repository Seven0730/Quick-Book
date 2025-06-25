'use client';
import Link from 'next/link';
import { useJobs } from '@/hooks/customer/jobs';

export default function CustomerJobsPage() {
    const { data: jobs, isLoading, error } = useJobs();

    if (isLoading) return <p>Loading your jobs…</p>;
    if (error) return <p className="text-red-500">Error: {error.message}</p>;
    if (!jobs || jobs.length === 0) {
        return (
            <div>
                <p>You have not created any jobs yet.</p>
                <Link
                    href="/customer/create"
                    className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Create your first job
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">My Jobs</h1>
            <ul className="divide-y">
                {jobs.map(job => (
                    <li key={job.id} className="py-2 flex justify-between">
                        <Link
                            href={`/customer/${job.id}`}
                            className="text-blue-600 hover:underline"
                        >
                            Job #{job.id}
                        </Link>
                        <span className="capitalize">{job.status.toLowerCase()}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
