'use client';

import Link from 'next/link';
import { useJobs } from '@/hooks/customer/jobs';
import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import type { Job } from '@/types';

export default function CustomerHistoryPage() {
  const { data: jobs = [], isLoading, error } = useJobs();
  const toastShown = useRef<{error?: boolean; noJobs?: boolean}>({});

  useEffect(() => {
    if (error && !toastShown.current.error) {
      toast.error('Failed to load job history.');
      toastShown.current.error = true;
    }
  }, [error]);

  useEffect(() => {
    if (!isLoading && jobs.length === 0 && !toastShown.current.noJobs) {
      toast('No job history found.');
      toastShown.current.noJobs = true;
    }
  }, [isLoading, jobs.length]);

  if (isLoading) return <p>Loading jobs…</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;
  if (jobs.length === 0) return <p>No jobs yet.</p>;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">My Job History</h1>
      <ul className="divide-y">
        {jobs.map((job: Job) => (
          <li key={job.id} className="py-3 flex justify-between items-center">
            <div>
              <Link
                href={`/customer/history/${job.id}`}
                className="text-blue-600 hover:underline"
              >
                Job #{job.id}
              </Link>
              <p className="text-sm text-gray-600">
                {new Date(job.createdAt).toLocaleString()} — {job.status}
              </p>
            </div>
            <span className={`px-2 py-0.5 rounded text-sm ${job.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' :
              job.status === 'BOOKED' ? 'bg-green-200 text-green-800' :
                'bg-gray-200 text-gray-800'
              }`}>
              {job.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
