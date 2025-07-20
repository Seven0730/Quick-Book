'use client';
import { useState, useEffect } from 'react';
import { usePendingJobs } from '@/hooks/provider/usePendingJobs';
import { useProviderContext } from '@/contexts/ProviderContext';
import { QuickBookCard } from '@/components/QuickBookCard';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { useRouter } from 'next/navigation';

export default function ProviderQuickBookPage() {
    const { providerId, setProviderId } = useProviderContext();
    const router = useRouter();
    const { data: initial = [] } = usePendingJobs();
    const jobs = initial;

    useEffect(() => {
        if (providerId == null) {
            router.replace('/provider/login');
        }
    }, [providerId, router]);
    if (providerId == null) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 py-8">
            <div className="max-w-md mx-auto p-4 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-pink-500 animate-bounce">
                        <FlashOnIcon fontSize="large" />
                    </span>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-blue-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">Quick-Book</h1>
                </div>
                <div className="space-y-4">
                    {jobs.map(job => (
                        <QuickBookCard key={job.id} job={job} />
                    ))}
                </div>
            </div>
        </div>
    );
}

