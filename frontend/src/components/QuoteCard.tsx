import type { Bid, Job } from '@/types';
import { useRouter } from 'next/navigation';
import { fetcher } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface QuoteCardProps {
  bid: Bid;
  jobId: number;
}

export function QuoteCard({ bid, jobId }: QuoteCardProps) {
  const router = useRouter();
  return (
    <div className="border-2 border-blue-200 bg-blue-50/60 p-4 rounded-xl shadow flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="font-bold text-blue-700">Provider #{bid.providerId}</span>
        <span className="ml-auto text-lg font-bold text-green-600">${bid.price.toFixed(2)}</span>
      </div>
      <p className="text-gray-600 text-sm">{bid.note}</p>
      <button
        className="self-end px-4 py-1 bg-gradient-to-r from-green-400 to-blue-400 text-white font-bold rounded shadow hover:scale-105 transition-all"
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
  );
} 