import type { Bid } from '@/types';
import { QuoteCard } from './QuoteCard';

interface QuoteListProps {
  bids: Bid[];
  jobId: number;
}

export function QuoteList({ bids, jobId }: QuoteListProps) {
  if (bids.length === 0) {
    return <p className="text-gray-500">No bids received.</p>;
  }
  return (
    <div className="space-y-4">
      {bids.map(bid => (
        <QuoteCard key={bid.id} bid={bid} jobId={jobId} />
      ))}
    </div>
  );
} 