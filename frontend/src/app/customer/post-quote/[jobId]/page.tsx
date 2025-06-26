'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useJob } from '@/hooks/customer/jobs';
import { useTopBids } from '@/hooks/customer/useTopBids';
import { useAppSocket } from '@/lib/hooks/useAppSocket';
import { fetcher } from '@/lib/api';
import { toast } from 'react-hot-toast';
import type { Bid, Job } from '@/types';

export default function CustomerPostQuoteWaitingPage() {
    const router = useRouter();
    const jobId = Number(usePathname()!.split('/').pop());
    const { data: job, isLoading, error, refetch: refetchJob } = useJob(jobId);
    const { data: topBids = [] } = useTopBids(jobId);
    const { socket, ready } = useAppSocket();

    const [biddingDone, setBiddingDone] = useState(false);

    useEffect(() => {
        if (!socket || !ready) return;

        const onBidReceived = (payload: { bid: Bid }) => {
            if (payload.bid.jobId === jobId) {
                toast(`New bid: $${payload.bid.price.toFixed(2)}`, { icon: '💬' });
            }
        };
        const onBooked = (updated: Job) => {
            if (updated.id === jobId) {
                toast.success('Auto-hired! Provider on the way 🚀');
                router.push(`/customer/post-quote/${jobId}/accepted`);
            }
        };
        const onWaveComplete = (payload: { jobId: number }) => {
            if (payload.jobId === jobId) {
                setBiddingDone(true);
                toast(`Bidding complete – choose from top 3!`, { icon: '🗳️' });
            }
        };

        socket.on('bid-received', onBidReceived);
        socket.on('job-booked', onBooked);
        socket.on('bidding-complete', onWaveComplete);

        return () => {
            socket.off('bid-received', onBidReceived);
            socket.off('job-booked', onBooked);
            socket.off('bidding-complete', onWaveComplete);
        };
    }, [socket, ready, jobId, router]);

    if (isLoading) return <p>Loading…</p>;
    if (error) return <p className="text-red-500">Error loading job</p>;
    if (!job) return <p>Job not found</p>;

    if (!biddingDone) {
        return (
            <div className="max-w-md mx-auto p-4 space-y-4">
                <h2 className="text-xl font-bold">Waiting for bids…</h2>
                <p>Your providers have three waves (3km / 10km / all) to submit bid.</p>
                <p><strong>Status:</strong> {job.status}</p>
            </div>
        );
    }

    // Bidding done — show top 3 quotes for manual accept
    return (
        <div className="max-w-md mx-auto p-4 space-y-4">
            <h2 className="text-xl font-bold">Select a Quote</h2>
            {topBids.map(bid => (
                <div key={bid.id} className="border p-3 rounded space-y-1">
                    <p>Provider #{bid.providerId} — ${bid.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{bid.note}</p>
                    <button
                        onClick={async () => {
                            try {
                                await fetcher<Job>(`/jobs/${jobId}/bids/${bid.id}/select`, {
                                    method: 'POST',
                                });
                                toast.success('You hired this provider! 🎉');
                                router.push(`/customer/post-quote/${jobId}/accepted`);
                            } catch (e: any) {
                                toast.error(`Select failed: ${e.message}`);
                            }
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                        Hire
                    </button>
                </div>
            ))}
        </div>
    );
}
