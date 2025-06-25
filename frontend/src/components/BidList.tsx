'use client';
import { useState, useEffect }  from 'react';
import { useTopBids }           from '@/lib/hooks/useTopBids';
import { useSocket }            from '@/lib/hooks/useSocket';
import { fetcher }              from '@/lib/api';
import type { Bid }             from '@/types';

interface Props {
  jobId: number;
  acceptPrice?: number;
  onHired: (bid: Bid) => void;
}

export function BidList({ jobId, acceptPrice, onHired }: Props) {
  const { data: bids, isLoading, error, refetch } = useTopBids(jobId);
  const { socket } = useSocket();
  const [autoHired, setAutoHired] = useState<boolean>(false);

  // real-time: when any provider bids, refetch
  useEffect(() => {
    if (!socket) return;
    const cb = (b: Bid) => {
      if (b.jobId === jobId) refetch();
      // auto-hire
      if (!autoHired && acceptPrice != null && b.price <= acceptPrice) {
        handleSelect(b.id);
        setAutoHired(true);
      }
    };
    socket.on('bid-received', cb);
    return () => { socket.off('bid-received', cb); };
  }, [socket, jobId, acceptPrice, autoHired, refetch]);

  async function handleSelect(bidId: number) {
    const hired = await fetcher<Bid>(`/jobs/${jobId}/bids/${bidId}/select`, {
      method: 'POST'
    });
    onHired(hired);
  }

  if (isLoading) return <p>Loading bids…</p>;
  if (error)     return <p className="text-red-500">Error: {error.message}</p>;
  if (!bids || bids.length === 0) return <p>No bids yet. Waiting…</p>;

  return (
    <ul className="space-y-2">
      {bids.map(b => (
        <li key={b.id} className="flex justify-between items-center p-2 border rounded">
          <div>
            <p>Provider #{b.providerId} — ${b.price.toFixed(2)}</p>
            <p className="text-sm text-gray-600">{b.note}</p>
          </div>
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded"
            onClick={() => handleSelect(b.id)}
          >
            {autoHired && b.price <= (acceptPrice ?? 0) ? 'Auto-Hired' : 'Select'}
          </button>
        </li>
      ))}
    </ul>
  );
}
