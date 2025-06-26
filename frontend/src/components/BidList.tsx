'use client';
import { useState, useEffect, useCallback } from 'react';
import { useTopBids } from '@/lib/hooks/useTopBids';
import { useAppSocket } from '@/lib/hooks/useAppSocket';
import { fetcher } from '@/lib/api';
import type { Bid } from '@/types';

interface Props {
  jobId: number;
  acceptPrice?: number;
  onHired: (bid: Bid) => void;
}

export function BidList({ jobId, acceptPrice, onHired }: Props) {
  const { data: bids, isLoading, error, refetch } = useTopBids(jobId);
  const { socket } = useAppSocket();
  const [autoHired, setAutoHired] = useState(false);

  const handleSelect = useCallback(
    async (bidId: number) => {
      const hired = await fetcher<Bid>(
        `/jobs/${jobId}/bids/${bidId}/select`,
        { method: 'POST' }
      );
      onHired(hired);
    },
    [jobId, onHired]
  );

  // 2) Now the effect can safely depend on handleSelect
  useEffect(() => {
    if (!socket) return;

    const onBid = (b: Bid) => {
      if (b.jobId === jobId) {
        refetch();

        // auto-hire logic
        if (
          !autoHired &&
          acceptPrice != null &&
          b.price <= acceptPrice
        ) {
          handleSelect(b.id);
          setAutoHired(true);
        }
      }
    };

    socket.on('bid-received', onBid);
    return () => {
      socket.off('bid-received', onBid);
    };
  }, [
    socket,
    jobId,
    acceptPrice,
    autoHired,
    refetch,
    handleSelect,
  ]);

  if (isLoading) return <p>Loading bids…</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;
  if (!bids || bids.length === 0) return <p>No bids yet. Waiting…</p>;

  return (
    <ul className="space-y-2">
      {bids.map((b) => (
        <li
          key={b.id}
          className="flex justify-between items-center p-2 border rounded"
        >
          <div>
            <p>
              Provider #{b.providerId} — ${b.price.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">{b.note}</p>
          </div>

          <button
            className="px-3 py-1 bg-blue-600 text-white rounded"
            onClick={() => handleSelect(b.id)}
          >
            {autoHired && acceptPrice != null && b.price <= acceptPrice
              ? 'Auto-Hired'
              : 'Select'}
          </button>
        </li>
      ))}
    </ul>
  );
}
