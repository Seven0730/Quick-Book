'use client';
import { usePathname } from 'next/navigation';
import { useJob, useJobBids } from '@/hooks/customer/jobs';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import WorkIcon from '@mui/icons-material/Work';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import GroupIcon from '@mui/icons-material/Group';

export default function CustomerJobDetailPage() {
    const path = usePathname()!;
    const jobId = Number(path.split('/').pop());

    const { data: job, isLoading, error } = useJob(jobId);
    const { data: bids, isLoading: bidsLoading } = useJobBids(jobId);
    const toastShown = useRef<{error?: boolean; notFound?: boolean}>({});

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

    if (isLoading) return <p>Loading job…</p>;
    if (error || !job) return <p className="text-red-500">Job not found</p>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 py-8">
            <div className="max-w-md mx-auto p-4 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-pink-500 animate-bounce">
                        <WorkIcon fontSize="large" />
                    </span>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-blue-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">Job #{job.id} Details</h1>
                </div>
                <div className="bg-white/80 rounded-xl shadow-lg p-6 space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <AssignmentTurnedInIcon className="text-blue-400" />
                        <span>Category:</span>
                        <span className="text-gray-700">{job.categoryId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <MonetizationOnIcon className="text-yellow-500" />
                        <span>Price:</span>
                        <span className="text-gray-700">${job.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <AccessTimeIcon className="text-pink-400" />
                        <span>Time slot:</span>
                        <span className="text-gray-700">{job.timeslot}</span>
                    </div>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <AssignmentTurnedInIcon className="text-green-500" />
                        <span>Status:</span>
                        <span className="text-gray-700">{job.status}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-6 mb-2">
                    <span className="text-blue-400 animate-bounce">
                        <GroupIcon fontSize="medium" />
                    </span>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent drop-shadow">Bids</h2>
                </div>
                <div className="bg-white/80 rounded-xl shadow-lg p-4">
                    {bidsLoading && <p>Loading bids…</p>}
                    {bids && bids.length === 0 && <p>No bids yet.</p>}
                    {bids && bids.length > 0 && (
                        <ul className="divide-y">
                            {bids.map(b => (
                                <li key={b.id} className="py-2 flex flex-col">
                                    <span className="font-semibold text-blue-600">Provider #{b.providerId}</span>
                                    <span className="text-yellow-700 font-bold">${b.price.toFixed(2)}</span>
                                    <span className="text-gray-600 text-sm mt-1">{b.note}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <Link
                    href="/customer/history"
                    className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-pink-400 via-blue-400 to-yellow-300 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200"
                >
                    ← Back to My Jobs
                </Link>
            </div>
        </div>
    );
}
