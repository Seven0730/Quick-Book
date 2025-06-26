'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState }    from 'react';
import { useJob }                  from '@/hooks/customer/jobs';
import { useTopBids }              from '@/hooks/customer/useTopBids';
import { fetcher }                 from '@/lib/api';
import { toast }                   from 'react-hot-toast';
import type { Job, Bid }           from '@/types';

const STAGE1 = 5 * 60;   // 5 minutes in seconds
const STAGE2 = 15 * 60;  // 15 minutes total

export default function CustomerPostQuoteWaitingPage() {
  const router = useRouter();
  const jobId  = Number(usePathname()!.split('/').pop());
  const { data: job, isLoading: jl, error: je, refetch: refetchJob } = useJob(jobId);
  const { data: topBids = [], refetch: refetchBids } = useTopBids(jobId);

  const [elapsed,    setElapsed]    = useState(0);
  const [stage,      setStage]      = useState<1|2|3>(1);
  const [stageDone,  setStageDone]  = useState(false);

  // TICK every second
  useEffect(() => {
    const iv = setInterval(() => {
      setElapsed(e => e + 1);
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  // DETERMINE stage from elapsed
  useEffect(() => {
    if (elapsed < STAGE1) {
      setStage(1);
    } else if (elapsed < STAGE2) {
      setStage(2);
    } else {
      setStage(3);
      setStageDone(true);
    }
  }, [elapsed]);

  // When stage changes, toast
  useEffect(() => {
    if (stage === 2) toast('Wave 2 started!', { icon: '📢' });
    if (stage === 3) toast('Final wave: open bidding!', { icon: '⚡' });
  }, [stage]);

  // If wave 3 is done, fetch top bids
  useEffect(() => {
    if (stageDone) {
      refetchBids();
    }
  }, [stageDone, refetchBids]);

  // Poll job status too (in case auto-hire happens)
  useEffect(() => {
    const iv2 = setInterval(() => {
      refetchJob();
    }, 5000);
    return () => clearInterval(iv2);
  }, [refetchJob]);

  if (jl)        return <p>Loading job…</p>;
  if (je)        return <p className="text-red-500">Error: {je.message}</p>;
  if (!job)      return <p>Job not found</p>;
  if (job.status == 'BOOKED') {
    router.push(`/customer/post-quote/${jobId}/accepted`);
    return null;
  }

  // --- STILL IN BIDDING ---
  if (!stageDone) {
    const remaining = (stage === 1 ? STAGE1 : STAGE2) - elapsed;
    const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
    const ss = String(remaining % 60).padStart(2, '0');

    return (
      <div className="max-w-md mx-auto p-4 space-y-4">
        <h2 className="text-xl font-bold">Wave {stage} Bidding</h2>
        <p>
          {stage === 1
            ? 'Tier‐A providers within 3 km'
            : stage === 2
            ? 'Tier‐B providers within 10 km'
            : 'All providers'}
        </p>
        <p><strong>Time remaining:</strong> {mm}:{ss}</p>
        <p><strong>Accept Price:</strong> ${job.acceptPrice!.toFixed(2)}</p>
      </div>
    );
  }

  // --- BIDDING DONE: SHOW TOP 3 QUOTES ---
  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">Choose a Quote</h2>
      {topBids.length === 0 && <p>No bids received.</p>}
      {topBids.map((bid: Bid) => (
        <div key={bid.id} className="border p-3 rounded space-y-2">
          <p>Provider #{bid.providerId} — <strong>${bid.price.toFixed(2)}</strong></p>
          <p className="text-gray-600">{bid.note}</p>
          <button
            className="px-4 py-1 bg-green-600 text-white rounded"
            onClick={async () => {
              try {
                await fetcher<Job>(
                  `/jobs/${jobId}/bids/${bid.id}/select`,
                  { method: 'POST' }
                );
                toast.success('Hired! 🎉');
                router.push(`/customer/post-quote/${jobId}/accepted`);
              } catch (err: any) {
                toast.error(`Failed to hire: ${err.message}`);
              }
            }}
          >
            Hire
          </button>
        </div>
      ))}
    </div>
  );
}
