'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useBidDetails } from '@/hooks/provider/useBidDetails';
import { useCancelBid } from '@/hooks/provider/useCancelBid';
import { useProviderContext } from '@/contexts/ProviderContext';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useEffect, useRef } from 'react';
import type { Bid } from '@/types';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

export default function ProviderBidDetailPage() {
    const { providerId, setProviderId } = useProviderContext();
    const router = useRouter();
    const bidId = Number(usePathname()!.split('/').pop());
    const { data: bid, isLoading, error } = useBidDetails(bidId);
    const toastShown = useRef<{error?: boolean; notFound?: boolean}>({});

    const cancelBid = useCancelBid();

    useEffect(() => {
        if (error && !toastShown.current.error) {
            toast.error('Failed to load bid.');
            toastShown.current.error = true;
        }
    }, [error]);

    useEffect(() => {
        if (!bid && !isLoading && !toastShown.current.notFound) {
            toast.error('Bid not found.');
            toastShown.current.notFound = true;
        }
    }, [bid, isLoading]);

    async function handleCancelBid() {
        if (!bid) return;
        toast.loading('Cancelling bid...');
        try {
            await cancelBid.mutateAsync({ jobId: bid.job.id });
            toast.dismiss();
            toast.success('Bid cancelled successfully');
            router.back();
        } catch (e: any) {
            toast.dismiss();
            toast.error(`Cancel failed: ${e.message}`);
        }
    }

    if (isLoading) return <p>Loading bid...</p>;
    if (!bid) return <p>Bid not found</p>;

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

    const status = deriveStatus(bid);

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 py-8">
            <div className="max-w-md mx-auto p-4 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-500 animate-bounce">
                        <AssignmentTurnedInIcon fontSize="large" />
                    </span>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 via-blue-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">Bid Detail #{bid.id}</h1>
                </div>
                <div className="bg-white/80 rounded-xl shadow-lg p-6 space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <span>Job:</span>
                        <span className="text-blue-700">#{bid.job.id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <span>Bid:</span>
                        <span className="text-yellow-700 font-bold">${bid.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <span>Note:</span>
                        <span className="text-gray-700">{bid.note || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <span>Status:</span>
                        <span className="text-gray-700 font-bold">{status}</span>
                    </div>
                </div>
                {status === 'ACCEPTED' && (
                    <button
                        onClick={handleCancelBid}
                        disabled={cancelBid.isPending}
                        className="mt-4 px-6 py-2 bg-gradient-to-r from-red-400 via-pink-400 to-yellow-300 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200 disabled:opacity-50"
                    >
                        {cancelBid.isPending ? 'Cancelling...' : 'Cancel this bid'}
                    </button>
                )}
                <Link
                    href="/provider/history"
                    className="block mt-4 px-6 py-2 bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-300 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200"
                >
                    ← Return to history
                </Link>
            </div>
        </div>
    );
}
