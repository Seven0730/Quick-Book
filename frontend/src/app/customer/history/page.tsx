'use client';

import Link from 'next/link';
import { useJobs } from '@/hooks/customer/jobs';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { Job } from '@/types';
import Pagination from '@mui/material/Pagination';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import CancelIcon from '@mui/icons-material/Cancel';

export default function CustomerHistoryPage() {
  const { data: jobs = [], isLoading, error } = useJobs();
  const toastShown = useRef<{error?: boolean; noJobs?: boolean}>({});
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const sortedJobs = [...jobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const totalPages = Math.ceil(sortedJobs.length / pageSize);
  const pagedJobs = sortedJobs.slice((page - 1) * pageSize, page * pageSize);

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
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 py-8">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-pink-500 animate-bounce">
            <CheckCircleIcon fontSize="large" />
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-blue-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">My Job History</h1>
        </div>
        <ul className="space-y-4">
          {pagedJobs.map((job: Job) => (
            <li
              key={job.id}
              className="rounded-xl shadow-lg bg-white/80 px-6 py-4 flex justify-between items-center transition-transform duration-200 hover:scale-105 hover:shadow-2xl group border border-pink-100"
            >
              <div>
                <Link
                  href={`/customer/history/${job.id}`}
                  className="text-blue-600 font-bold text-lg hover:underline hover:text-pink-500 transition-colors"
                >
                  Job #{job.id}
                </Link>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(job.createdAt).toLocaleString()} —
                  <span className="ml-1 font-semibold">
                    {job.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 text-yellow-600 animate-pulse">
                        <HourglassBottomIcon fontSize="small" /> Pending
                      </span>
                    )}
                    {job.status === 'BOOKED' && (
                      <span className="inline-flex items-center gap-1 text-green-600 animate-bounce">
                        <CheckCircleIcon fontSize="small" /> Booked
                      </span>
                    )}
                    {job.status !== 'PENDING' && job.status !== 'BOOKED' && (
                      <span className="inline-flex items-center gap-1 text-gray-500">
                        <CancelIcon fontSize="small" /> {job.status}
                      </span>
                    )}
                  </span>
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-bold shadow transition-all
                  ${job.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800 group-hover:bg-yellow-300' :
                    job.status === 'BOOKED' ? 'bg-green-200 text-green-800 group-hover:bg-green-300' :
                    'bg-gray-200 text-gray-800 group-hover:bg-gray-300'}
                animate-fadeIn`}
              >
                {job.status}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex justify-center items-center mt-6">
          <Pagination
            count={totalPages || 1}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="secondary"
            shape="rounded"
            size="large"
            showFirstButton
            showLastButton
            sx={{
              '& .Mui-selected': {
                background: 'linear-gradient(90deg,#f472b6,#60a5fa,#fde68a)',
                color: '#fff',
                fontWeight: 'bold',
              },
              '& .MuiPaginationItem-root': {
                borderRadius: '12px',
                transition: 'all 0.2s',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
