'use client';

import { useState } from 'react';
import { CategorySelect } from '@/components/CategorySelect';
import { usePostJob }     from '@/lib/hooks/usePostJob';

export default function PostQuotePage() {
  const [catId, setCatId]             = useState<number>();
  const [description, setDescription] = useState('');
  const [acceptPrice, setAcceptPrice] = useState<number>();
  const { mutate, data: job, isPending, error } = usePostJob();

  const handleSubmit = () => {
    if (!catId || !description) return;
    mutate({
      categoryId:  catId,
      description,
      acceptPrice: acceptPrice ?? undefined,
      customerLat: 1.3521,
      customerLon: 103.8198,
    });
  };

  if (job) {
    return (
      <div className="max-w-md mx-auto p-4">
        <h2 className="text-xl font-bold">Job Posted!</h2>
        <p>Your job is live. ID: <strong>{job.id}</strong></p>
        <p>Once bids arrive you’ll see them here:</p>
        {/* could link to a “/post-quote/[id]/bids” page */}
      </div>
    );
  }

  return (
    <main className="max-w-md mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Post &amp; Quote</h1>

      <div>
        <label className="block mb-1">1. Service Category</label>
        <CategorySelect value={catId} onChange={setCatId} />
      </div>

      <div>
        <label className="block mb-1">2. Description</label>
        <textarea
          className="w-full border p-2 rounded"
          rows={4}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="block mb-1">3. (Optional) Accept Price</label>
        <input
          type="number"
          className="w-full border p-2 rounded"
          placeholder="e.g. 120"
          value={acceptPrice ?? ''}
          onChange={e => setAcceptPrice(Number(e.target.value))}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isPending || !catId || !description}
        className="w-full py-2 bg-green-600 text-white rounded disabled:opacity-50"
      >
        {isPending ? 'Posting…' : 'Post Job & Get Quotes'}
      </button>

      {error && <p className="text-red-500">{error.message}</p>}
    </main>
  );
}
