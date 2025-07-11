'use client';
import Link from 'next/link';
import { useProviderBids } from '@/hooks/provider/useProviderBids';
import { useProviderContext } from '@/contexts/ProviderContext';
import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import type { Bid } from '@/types';

export default function ProviderHistoryPage() {
    const { providerId, setProviderId } = useProviderContext();
    const { data: bids = [], isLoading, error } = useProviderBids(providerId ?? undefined);
    const toastShown = useRef<{error?: boolean; noHistory?: boolean}>({});

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
                <input
                    type="number"
                    placeholder="Enter your providerId"
                    className="w-full border p-2 rounded"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const val = Number((e.target as HTMLInputElement).value);
                            if (!isNaN(val)) setProviderId(val);
                        }
                    }}
                />
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
        <div className="max-w-2xl mx-auto p-4 space-y-4">
            <h1 className="text-2xl font-bold">My History</h1>
            <ul className="divide-y">
                {bids.map(bid => {
                    const status = deriveStatus(bid);
                    const color =
                        status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' :
                            status === 'ACCEPTED' ? 'bg-green-200 text-green-800' :
                                status === 'FAILED' ? 'bg-red-200 text-red-800' :
            /*CANCELLED*/           'bg-gray-200 text-gray-800';

                    return (
                        <li key={bid.id} className="py-3 flex justify-between items-center">
                            <Link
                                href={`/provider/history/${bid.id}`}
                                className="text-blue-600 hover:underline"
                            >
                                Bid #{bid.id} on Job #{bid.job.id}
                            </Link>
                            <span className={`px-2 py-0.5 rounded text-sm ${color}`}>
                                {status}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
