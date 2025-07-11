import { useEffect, useState } from 'react';
import { useAppSocket } from '@/lib/hooks/useAppSocket';
import { useProviderContext } from '@/contexts/ProviderContext';
import { fetcher } from '@/lib/api';
import { toast } from 'react-hot-toast';
import type { Job } from '@/types';

export function QuickBookCard({ job }: { job: Job }) {
    const { socket } = useAppSocket();
    const { providerId } = useProviderContext();
    const [timer, setTimer] = useState(30);
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        if (hidden) return;
        const iv = setInterval(() => setTimer(t => t - 1), 1000);
        return () => clearInterval(iv);
    }, [hidden]);

    async function accept() {
        if (!providerId) return;
        toast.loading('Accepting job...');
        try {
            await fetcher<Job>(`/jobs/${job.id}/accept`, {
                method: 'POST',
                headers: { 'x-provider-id': String(providerId) },
            });
            toast.dismiss();
            toast.success('Job accepted successfully!');
            setHidden(true);
        } catch (err: any) {
            toast.dismiss();
            toast.error(`Accept failed: ${err.message}`);
        }
    }

    function decline() {
        setHidden(true);
        socket?.emit('decline', job.id);
    }

    if (hidden) return null;

    return (
        <div className="border p-4 rounded bg-yellow-50 space-y-2">
            <div className="flex justify-between items-center">
                <span>Job #{job.id}</span>
                <span>⏱ {timer}s</span>
            </div>
            <p>Category: {job.categoryId}</p>
            <p>Price: ${job.price.toFixed(2)}</p>
            <p>Timeslot: {job.timeslot}</p>

            <div className="flex space-x-2">
                <button
                    onClick={accept}
                    disabled={timer <= 0}
                    className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
                >
                    Accept
                </button>
                <button
                    onClick={decline}
                    disabled={timer <= 0}
                    className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
                >
                    Decline
                </button>
            </div>
        </div>
    );
}

