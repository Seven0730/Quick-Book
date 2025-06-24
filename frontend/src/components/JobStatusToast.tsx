'use client';
import { useEffect, useState } from 'react';
import { useSocket }           from '@/lib/hooks/useSocket';

interface Props { jobId: number }

export function JobStatusToast({ jobId }: Props) {
  const { socket, connected } = useSocket();
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    if (!socket) return;
    const onBooked = (payload: any) => {
      if (payload.id === jobId) {
        setMessage('🎉 Your job has been booked!');
      }
    };
    const onCancelled = (payload: any) => {
      if (payload.jobId === jobId) {
        setMessage('⚠️ Your job was cancelled by the provider');
      }
    };

    socket.on('job-booked',   onBooked);
    socket.on('job-cancelled', onCancelled);

    return () => {
      socket.off('job-booked', onBooked);
      socket.off('job-cancelled', onCancelled);
    };
  }, [socket, jobId]);

  if (!message) return null;
  return (
    <div className="fixed bottom-4 right-4 bg-white shadow p-4 rounded">
      {message}
    </div>
  );
}
