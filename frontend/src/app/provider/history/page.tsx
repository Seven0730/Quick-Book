'use client';
import Link from 'next/link';
import { useProviderBids } from '@/hooks/provider/useProviderBids';
import { useProviderContext } from '@/contexts/ProviderContext';
import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import type { Bid } from '@/types';
import HistoryIcon from '@mui/icons-material/History';
import { ProviderIdInput } from '@/components/ProviderIdInput';
import { useRouter } from 'next/navigation';

export default function ProviderHistoryPage() {
    const { providerId, setProviderId } = useProviderContext();
    const router = useRouter();
    const { data: bids = [], isLoading, error } = useProviderBids(providerId ?? undefined);
    const toastShown = useRef<{error?: boolean; noHistory?: boolean}>({});

    useEffect(() => {
        if (providerId == null) {
            router.replace('/provider/login');
        }
    }, [providerId, router]);
    if (providerId == null) return null;

    useEffect(() => {
        if (error && !toastShown.current.error) {
            toast.error('Failed to load bid history.');
            toastShown.current.error = true;
        }
    }, [error]);

    useEffect(() => {
        if (!isLoading && bids.length === 0 && !toastShown.current.noHistory) {
            toast('No bid history found.');
            toastShown.current.noHistory = true;
        }
    }, [isLoading, bids.length]);

    if (providerId == null) {
        return (
            <div className="max-w-sm mx-auto p-4 space-y-4">
                <h1 className="text-xl font-bold">Provider Login</h1>
                <ProviderIdInput onSubmit={setProviderId} />
                <p className="text-sm text-gray-600">Press Enter to connect</p>
            </div>
        );
    }

    if (isLoading) return <p>loading...</p>;
    if (error) return <p className="text-red-500">error: {error.message}</p>;
    if (bids.length === 0) return <p>No history yet</p>;

    function deriveStatus(bid: Bid) {
        const { job } = bid;
        if (job.status === 'BOOKED') {
            return job.acceptedById === bid.providerId
                ? 'ACCEPTED'
                : 'FAILED';
        }
        if (job.status === 'CANCELLED_BY_PROVIDER') {
            return 'CANCELLED';
        }
        return 'PENDING';
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 py-8">
            <div className="max-w-2xl mx-auto p-4 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-400 animate-bounce">
                        <HistoryIcon fontSize="large" />
                    </span>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">My Bid History</h1>
                </div>
                <ul className="space-y-4">
                    {bids.map(bid => {
                        const status = deriveStatus(bid);
                        const color =
                            status === 'PENDING' ? 'bg-yellow-200 text-yellow-800 group-hover:bg-yellow-300' :
                                status === 'ACCEPTED' ? 'bg-green-200 text-green-800 group-hover:bg-green-300' :
                                    status === 'FAILED' ? 'bg-red-200 text-red-800 group-hover:bg-red-300' :
                /*CANCELLED*/           'bg-gray-200 text-gray-800 group-hover:bg-gray-300';

                        return (
                            <li key={bid.id} className="rounded-xl shadow-lg bg-white/80 px-6 py-4 flex justify-between items-center transition-transform duration-200 hover:scale-105 hover:shadow-2xl group border border-pink-100">
                                <Link
                                    href={`/provider/history/${bid.id}`}
                                    className="text-blue-600 font-bold text-lg hover:underline hover:text-pink-500 transition-colors"
                                >
                                    Bid #{bid.id} on Job #{bid.job.id}
                                </Link>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold shadow transition-all ${color} animate-fadeIn`}>
                                    {status}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
