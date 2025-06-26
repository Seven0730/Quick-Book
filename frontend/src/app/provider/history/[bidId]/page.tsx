'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useBidDetails } from '@/hooks/provider/useBidDetails';
import { useCancelBid } from '@/hooks/provider/useCancelBid';
import { useProviderContext } from '@/contexts/ProviderContext';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import type { Bid } from '@/types';

export default function ProviderBidDetailPage() {
    const { providerId, setProviderId } = useProviderContext();
    const router = useRouter();
    const bidId = Number(usePathname()!.split('/').pop());
    const { data: bid  } = useBidDetails(bidId);

    const cancelBid = useCancelBid();

    if (!bid) return <p>bid doesn't exist</p>;

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
        <div className="max-w-md mx-auto p-4 space-y-4">
            <h1 className="text-2xl font-bold">Bid detail #{bid.id}</h1>
            <p>Job: #{bid.job.id}</p>
            <p>Bid: ${bid.price.toFixed(2)}</p>
            <p>Note: {bid.note || '—'}</p>
            <p>Status: <strong>{status}</strong></p>

            {status === 'ACCEPTED' && (
                <button
                    onClick={async () => {
                        try {
                            await cancelBid.mutateAsync({ jobId: bid.job.id });
                            toast.success('cancelled successfully');
                            router.back();
                        } catch (e: any) {
                            toast.error(`cancel failed: ${e.message}`);
                        }
                    }}
                    disabled={cancelBid.isPending}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
                >
                    {cancelBid.isPending ? 'pending' : 'cancel this bid'}
                </button>
            )}

            <Link
                href="/provider/history"
                className="block mt-4 text-blue-600 hover:underline"
            >
                ← return to history
            </Link>
        </div>
    );
}
