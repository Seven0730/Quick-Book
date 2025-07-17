'use client'

import { useEffect, useState, useRef } from 'react'
import { usePendingJobs } from '@/hooks/provider/usePendingJobs'
import { usePostBid } from '@/hooks/provider/usePostBid'
import { useAppSocket } from '@/lib/hooks/useAppSocket'
import { useProviderContext } from '@/contexts/ProviderContext'
import { useRouter } from 'next/navigation';

import type { Job } from '@/types'
import toast from 'react-hot-toast'
import ChatIcon from '@mui/icons-material/Chat';

export default function ProviderPostQuotePage() {
    const { providerId, setProviderId } = useProviderContext();
    const router = useRouter();
    const { data: initialJobs = [], isLoading, error } = usePendingJobs();
    const postBid = usePostBid()
    const { socket, ready } = useAppSocket()
    const toastShown = useRef<{error?: boolean; noJobs?: boolean}>({});

    const [jobs, setJobs] = useState<Job[]>(initialJobs)

    useEffect(() => {
        setJobs(initialJobs)
    }, [initialJobs])

    useEffect(() => {
        if (!socket || !ready) return
        const onNew = (job: Job) => {
            if (job.status === 'PENDING') {
                toast(`New job #${job.id}`, { icon: '🆕' })
                setJobs(js => [job, ...js])
            }
        }
        socket.on('new-job', onNew)
        return () => {
            socket.off('new-job', onNew)
        }
    }, [socket, ready])

    useEffect(() => {
        if (error && !toastShown.current.error) {
            toast.error('Failed to load jobs.');
            toastShown.current.error = true;
        }
    }, [error]);

    useEffect(() => {
        if (!isLoading && jobs.length === 0 && !toastShown.current.noJobs) {
            toast('No Post & Quote jobs available right now.');
            toastShown.current.noJobs = true;
        }
    }, [isLoading, jobs.length]);

    useEffect(() => {
        if (providerId == null) {
            router.replace('/provider/login');
        }
    }, [providerId, router]);
    if (providerId == null) return null;

    if (isLoading) return <p>Loading jobs…</p>
    if (!jobs.length) return <p>No Post & Quote jobs right now.</p>

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 py-8">
            <div className="max-w-md mx-auto p-4 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-pink-500 animate-bounce">
                        <ChatIcon fontSize="large" />
                    </span>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-blue-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">Post & Quote Jobs</h1>
                </div>
                <div className="space-y-4">
                    {jobs.map(job => (
                        <JobBidForm key={job.id} job={job} providerId={providerId!} postBid={postBid} />
                    ))}
                </div>
            </div>
        </div>
    )
}

function JobBidForm({
    job,
    providerId,
    postBid
}: {
    job: Job
    providerId: number
    postBid: ReturnType<typeof usePostBid>
}) {
    const [price, setPrice] = useState<number>(0)
    const [note, setNote] = useState<string>('')

    const onSubmit = () => {
        if (price <= 0) return;
        toast.loading('Submitting bid...');
        postBid.mutate(
            { jobId: job.id, providerId, price, note },
            {
                onSuccess: (bid) => {
                    toast.dismiss();
                    toast.success(`Bid #${bid.id} submitted successfully!`);
                    setPrice(0);
                    setNote('');
                },
                onError: (err) => {
                    toast.dismiss();
                    toast.error(`Failed to submit bid: ${err.message}`);
                },
            }
        );
    }

    return (
        <div className="bg-white/80 border border-pink-100 rounded-xl shadow-lg p-6 space-y-3">
            <p className="font-semibold text-blue-600"><strong>Job #{job.id}</strong> — AcceptPrice: ${job.acceptPrice!.toFixed(2)}</p>
            <p className="text-gray-700">{job.description}</p>
            <div className="flex flex-col sm:flex-row gap-2 items-stretch">
                <input
                    type="number" placeholder="Your price"
                    value={price}
                    onChange={e => setPrice(+e.target.value)}
                    className="border-2 border-blue-200 p-3 rounded-xl focus:border-blue-400 focus:outline-none transition-colors w-full sm:w-32 font-semibold"
                />
                <input
                    type="text" placeholder="Note (opt.)"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="border-2 border-pink-200 p-3 rounded-xl focus:border-pink-400 focus:outline-none transition-colors w-full font-semibold"
                />
                <button
                    onClick={onSubmit}
                    disabled={postBid.isPending || price <= 0}
                    className="px-4 py-2 bg-gradient-to-r from-green-400 via-blue-400 to-yellow-300 text-white font-bold rounded-xl shadow hover:scale-105 hover:shadow-2xl transition-all duration-200 disabled:opacity-50"
                >
                    {postBid.isPending ? 'Sending…' : 'Bid'}
                </button>
            </div>
        </div>
    )
}
