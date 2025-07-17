'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCategories } from '@/hooks/customer/useCategories';
import { usePostJob, PostJobPayload } from '@/hooks/customer/usePostJob';
import { usePriceGuidance } from '@/hooks/customer/usePriceGuidance';
import { TimeslotPicker } from '@/components/TimeslotPicker';
import { CategorySelect } from '@/components/CategorySelect';
import { toast } from 'react-hot-toast';
import ChatIcon from '@mui/icons-material/Chat';
import CategoryIcon from '@mui/icons-material/Category';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ScheduleIcon from '@mui/icons-material/Schedule';

export default function CustomerPostQuotePage() {
    const router = useRouter();
    const { data: cats = [] } = useCategories();
    const postJob = usePostJob();

    const [categoryId, setCategoryId] = useState<number>();
    const [acceptPrice, setAcceptPrice] = useState<number>(0);
    const [timeslot, setTimeslot] = useState('');

    const { data: guidance, isLoading: loadingGuidance } = usePriceGuidance(categoryId);

    const canSubmit = !!categoryId && !!timeslot && acceptPrice > 0;

    function handleSubmit() {
        if (!canSubmit) return;
        toast.loading('Posting job...');
        const payload: PostJobPayload = {
            categoryId: categoryId!,
            acceptPrice,
            timeslot,
            customerLat: 1.3521,
            customerLon: 103.8198,
            jobType: 'POSTQUOTE',
        };
        postJob.mutate(payload, {
            onSuccess: (job) => {
                toast.dismiss();
                toast.success(`Job #${job.id} posted successfully!`);
                router.push(`/customer/post-quote/${job.id}`);
            },
            onError: (err) => {
                toast.dismiss();
                toast.error(`Failed to post job: ${err.message}`);
            },
        });
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 py-8">
            <div className="max-w-md mx-auto p-4 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-pink-500 animate-bounce">
                        <ChatIcon fontSize="large" />
                    </span>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-blue-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">Post & Quote</h1>
                </div>

                <div className="bg-white/80 rounded-xl shadow-lg p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <CategoryIcon className="text-pink-500" />
                            <label className="block font-bold text-gray-700">Category</label>
                        </div>
                        <CategorySelect value={categoryId} onChange={setCategoryId} placeholder="Select…" />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <AttachMoneyIcon className="text-blue-500" />
                            <label className="block font-bold text-gray-700">Accept Price ($)</label>
                        </div>
                        <input
                            type="number"
                            className="w-full border-2 border-blue-200 p-3 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
                            value={acceptPrice}
                            onChange={e => setAcceptPrice(Number(e.target.value))}
                        />
                        {categoryId && (
                            <div className="text-sm text-gray-500 mt-1">
                                {loadingGuidance && 'Loading price guidance...'}
                                {guidance && (
                                    <>
                                        <span>Recommended: <b>${guidance.p50.toFixed(2)}</b></span>
                                        <button
                                            type="button"
                                            className="ml-2 px-2 py-1 bg-blue-100 rounded text-blue-600 hover:bg-blue-200"
                                            onClick={() => setAcceptPrice(guidance.p50)}
                                        >
                                            Use
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <ScheduleIcon className="text-yellow-500" />
                            <label className="block font-bold text-gray-700">Timeslot</label>
                        </div>
                        <TimeslotPicker value={timeslot} onChange={setTimeslot} />
                    </div>
                </div>

                <button
                    disabled={!canSubmit || postJob.isPending}
                    onClick={handleSubmit}
                    className="w-full py-3 bg-gradient-to-r from-pink-400 via-blue-400 to-yellow-300 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-lg"
                >
                    {postJob.isPending ? 'Posting...' : 'Post Job'}
                </button>
            </div>
        </div>
    );
}
