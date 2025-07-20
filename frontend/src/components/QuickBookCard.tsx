import { useEffect, useState } from 'react';
import { useAppSocket } from '@/lib/hooks/useAppSocket';
import { useProviderContext } from '@/contexts/ProviderContext';
import { fetcher } from '@/lib/api';
import { toast } from 'react-hot-toast';
import type { Job } from '@/types';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export function QuickBookCard({ job }: { job: Job }) {
    const { socket } = useAppSocket();
    const { providerId } = useProviderContext();
    const [timer, setTimer] = useState(() => {
        const created = new Date(job.createdAt).getTime();
        const now = Date.now();
        return Math.max(0, 30 - Math.floor((now - created) / 1000));
    });
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const created = new Date(job.createdAt).getTime();
            const now = Date.now();
            setTimer(Math.max(0, 30 - Math.floor((now - created) / 1000)));
        }, 1000);
        return () => clearInterval(interval);
    }, [job.createdAt]);

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
        <div className="bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 rounded-2xl shadow-xl p-6 space-y-4 border border-pink-200 animate-fadeIn">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-pink-500 animate-bounce">
                    <FlashOnIcon fontSize="large" />
                </span>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-blue-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">
                    Quick-Book Job #{job.id}
                </span>
                <span className="ml-auto text-sm font-bold text-blue-700 flex items-center gap-1">
                    ⏱ <span className={timer <= 5 ? 'text-red-500 animate-pulse' : ''}>{timer}s</span>
                </span>
            </div>
            <div className="flex items-center gap-2 text-lg font-semibold">
                <MonetizationOnIcon className="text-yellow-500" />
                <span>Price:</span>
                <span className="text-gray-700">${job.price.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 text-lg font-semibold">
                <AccessTimeIcon className="text-blue-500" />
                <span>Timeslot:</span>
                <span className="text-gray-700">{job.timeslot}</span>
            </div>
            <div className="flex items-center gap-2 text-lg font-semibold">
                <span className="text-pink-500 font-bold">Category:</span>
                <span className="text-gray-700">{job.categoryId}</span>
            </div>
            <div className="flex space-x-2 mt-4">
                <button
                    onClick={accept}
                    disabled={timer <= 0}
                    className="px-6 py-2 bg-gradient-to-r from-green-400 via-blue-400 to-yellow-300 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200 disabled:opacity-50"
                >
                    Accept
                </button>
                <button
                    onClick={decline}
                    disabled={timer <= 0}
                    className="px-6 py-2 bg-gradient-to-r from-red-400 via-pink-400 to-yellow-300 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200 disabled:opacity-50"
                >
                    Decline
                </button>
            </div>
        </div>
    );
}

