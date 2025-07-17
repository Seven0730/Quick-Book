'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef }    from 'react';
import { useJob }                  from '@/hooks/customer/jobs';
import { useTopBids }              from '@/hooks/customer/useTopBids';
import { fetcher }                 from '@/lib/api';
import { toast }                   from 'react-hot-toast';
import type { Job, Bid }           from '@/types';
import { HourglassEmpty, EmojiEvents, Bolt } from '@mui/icons-material';
import { BiddingStageCard } from '@/components/BiddingStageCard';
import { QuoteList } from '@/components/QuoteList';

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
  const toastShown = useRef<{error?: boolean; notFound?: boolean; hired?: boolean}>({});

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

  useEffect(() => {
    if (je && !toastShown.current.error) {
      toast.error('Failed to load job.');
      toastShown.current.error = true;
    }
  }, [je]);

  useEffect(() => {
    if (!job && !jl && !toastShown.current.notFound) {
      toast.error('Job not found.');
      toastShown.current.notFound = true;
    }
  }, [job, jl]);

  useEffect(() => {
    if (job?.status === 'BOOKED' && !toastShown.current.hired) {
      toast.success('Job has already been hired!');
      toastShown.current.hired = true;
    }
  }, [job]);

  if (jl)        return <p>Loading job…</p>;
  if (je)        return <p className="text-red-500">Error: {je.message}</p>;
  if (!job)      return <p>Job not found</p>;
  if (job.status == 'BOOKED') {
    router.push(`/customer/post-quote/${jobId}/accepted`);
    return null;
  }

  // --- STILL IN BIDDING ---
  if (!stageDone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 flex items-center justify-center py-8">
        <BiddingStageCard
          stage={stage}
          elapsed={elapsed}
          STAGE1={STAGE1}
          STAGE2={STAGE2}
          acceptPrice={job.acceptPrice!}
        />
      </div>
    );
  }

  // --- BIDDING DONE: SHOW TOP 3 QUOTES ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 flex items-center justify-center py-8">
      <div className="max-w-md w-full mx-auto p-6 bg-white/80 rounded-2xl shadow-2xl space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-yellow-400"><svg width="32" height="32" fill="currentColor"><circle cx="16" cy="16" r="16"/></svg></span>
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-blue-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">
            Choose a Quote
          </h2>
        </div>
        <QuoteList bids={topBids} jobId={jobId} />
      </div>
    </div>
  );
}
