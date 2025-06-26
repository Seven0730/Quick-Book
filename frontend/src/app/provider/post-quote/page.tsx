'use client'

import { useEffect, useState } from 'react'
import { usePendingJobs } from '@/hooks/provider/usePendingJobs'
import { usePostBid } from '@/hooks/provider/usePostBid'
import { useAppSocket } from '@/lib/hooks/useAppSocket'
import { useProviderContext } from '@/contexts/ProviderContext'

import type { Job } from '@/types'
import toast from 'react-hot-toast'

export default function ProviderPostQuotePage() {
    const { providerId, setProviderId } = useProviderContext();
    const { data: initialJobs = [], isLoading } = usePendingJobs();
    const postBid = usePostBid()
    const { socket, ready } = useAppSocket()

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

    if (providerId == null) {
        return (
            <div className="max-w-sm mx-auto p-4 space-y-4">
                <h1 className="text-xl font-bold">Provider Login</h1>
                <input
                    type="number"
                    placeholder="Enter your providerId"
                    className="w-full border p-2 rounded"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const val = Number((e.target as HTMLInputElement).value);
                            if (!isNaN(val)) setProviderId(val);
                        }
                    }}
                />
                <p className="text-sm text-gray-600">Press Enter to connect</p>
            </div>
        );
    }

    if (isLoading) return <p>Loading jobs…</p>
    if (!jobs.length) return <p>No Post & Quote jobs right now.</p>

    return (
        <div className="space-y-4 max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold">Post & Quote Jobs</h1>
            {jobs.map(job => (
                <JobBidForm key={job.id} job={job} providerId={providerId!} postBid={postBid} />
            ))}
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
        postBid.mutate(
            { jobId: job.id, providerId, price, note },
            {
                onSuccess: () => {
                    toast.success(`Bid submitted: $${price.toFixed(2)}`)
                    setPrice(0)
                    setNote('')
                },
                onError: (err) => {
                    toast.error(`Bid failed: ${err.message}`)
                }
            }
        )
    }

    return (
        <div className="border p-4 rounded space-y-2 bg-blue-50">
            <p><strong>Job #{job.id}</strong> — AcceptPrice: ${job.acceptPrice!.toFixed(2)}</p>
            <p>{job.description}</p>
            <div className="flex space-x-2">
                <input
                    type="number" placeholder="Your price"
                    value={price}
                    onChange={e => setPrice(+e.target.value)}
                    className="border p-1 rounded w-24"
                />
                <input
                    type="text" placeholder="Note (opt.)"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="border p-1 rounded flex-1"
                />
                <button
                    onClick={onSubmit}
                    disabled={postBid.isPending || price <= 0}
                    className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
                >
                    {postBid.isPending ? 'Sending…' : 'Bid'}
                </button>
            </div>
        </div>
    )
}
