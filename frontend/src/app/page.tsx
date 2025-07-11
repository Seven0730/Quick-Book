'use client';
import { useState } from 'react';
import { CategorySelect } from '@/components/CategorySelect';
import { PriceSlider } from '@/components/PriceSlider';
import { TimeslotPicker } from '@/components/TimeslotPicker';
import { fetcher } from '@/lib/api';
import type { Job } from '@/types';
import { JobStatusToast } from '@/components/JobStatusToast';
import { toast } from 'react-hot-toast';

export default function QuickBookPage() {
  const [catId, setCatId] = useState<number>();
  const [price, setPrice] = useState<number>(0);
  const [slot, setSlot] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [job, setJob] = useState<Job | null>(null);

  // For now, stub customer location
  const customerLat = 1.3521;
  const customerLon = 103.8198;

  const canSubmit = Boolean(catId && price > 0 && slot);

  async function handleConfirm() {
    if (!canSubmit) return;
    setSubmitting(true);
    toast.loading('Creating job...');
    try {
      const newJob = await fetcher<Job>('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          categoryId: catId,
          price,
          timeslot: slot,
          customerLat,
          customerLon
        })
      });
      toast.dismiss();
      toast.success(`Job #${newJob.id} created successfully!`);
      setJob(newJob);
    } catch (e: any) {
      toast.dismiss();
      toast.error(`Failed to create job: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (job) {
    return (
      <div className="max-w-md mx-auto p-4">
        <h2 className="text-xl font-bold mb-2">Booking Submitted!</h2>
        <p>Job ID: <strong>{job.id}</strong></p>
        <p>Status: <em>{job.status}</em></p>

        {/* WATCH FOR REAL-TIME UPDATES: */}
        <JobStatusToast jobId={job.id} />
      </div>
    );
  }

  return (
    <main className="max-w-md mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Quick Book</h1>

      {/* Step 1: Category */}
      <div>
        <label className="block mb-1">1. Service Category</label>
        <CategorySelect value={catId} onChange={setCatId} />
      </div>

      {/* Step 2: Price */}
      <div>
        <label className="block mb-1">2. Your Price</label>
        <PriceSlider categoryId={catId} value={price} onChange={setPrice} />
      </div>

      {/* Step 3: Timeslot */}
      <div>
        <label className="block mb-1">3. Arrival Window</label>
        <TimeslotPicker value={slot} onChange={setSlot} />
      </div>

      {/* Confirmation */}
      <button
        className="w-full py-2 px-4 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={!canSubmit || submitting}
        onClick={handleConfirm}
      >
        {submitting ? 'Submitting…' : 'Confirm Quick-Book'}
      </button>
    </main>
  );
}
