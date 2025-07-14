'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCategories } from '@/hooks/customer/useCategories';
import { usePriceGuidance } from '@/hooks/customer/usePriceGuidance';
import { fetcher } from '@/lib/api';
import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import type { Job } from '@/types';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import CategoryIcon from '@mui/icons-material/Category';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function CustomerQuickBookPage() {
    const router = useRouter();
    const qc = useQueryClient();

    const { data: cats = [] } = useCategories();
    const [catId, setCatId] = useState<number>();
    const priceGuidance = usePriceGuidance(catId);

    // suggested ±10% around median
    const median = priceGuidance.data?.p50 ?? 0;
    const low = +(median * 0.9).toFixed(2);
    const high = +(median * 1.1).toFixed(2);

    const [price, setPrice] = useState<number>(median);
    const [timeslot, setSlot] = useState<string>();

    // 生成 12 个 2 小时的时间段
    const windows = useMemo(() => Array.from({ length: 12 }).map((_, i) => {
      const start = new Date();
      start.setHours(start.getHours() + 2 * i, 0, 0, 0);
      const end = new Date(start);
      end.setHours(start.getHours() + 2);
      return {
        label: `${start.getHours()}:00–${end.getHours()}:00`,
        value: `${start.toISOString()}/${end.toISOString()}`,
      };
    }), []);

    // enable submit only when all fields set
    const canSubmit = !!catId && price > 0 && !!timeslot;

    async function handleConfirm() {
        if (!canSubmit) return;
        toast.loading('Creating quick-book job...');
        try {
            const job = await fetcher<Job>('/jobs', {
                method: 'POST',
                body: JSON.stringify({
                    categoryId: catId,
                    price,
                    timeslot,
                    // you might pull actual coords from browser geolocation
                    customerLat: 1.3521,
                    customerLon: 103.8198,
                }),
            });
            toast.dismiss();
            toast.success(`Quick-book job #${job.id} created successfully!`);
            // refresh customer jobs list
            qc.invalidateQueries({ queryKey: ['customer-jobs'] });
            router.push(`/customer/quick-book/${job.id}`);
        } catch (e: any) {
            toast.dismiss();
            toast.error(`Failed to create job: ${e.message}`);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 py-8">
            <div className="max-w-md mx-auto p-4 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-pink-500 animate-bounce">
                        <FlashOnIcon fontSize="large" />
                    </span>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-blue-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">Quick-Book a Service</h1>
                </div>

                <div className="bg-white/80 rounded-xl shadow-lg p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <CategoryIcon className="text-pink-500" />
                            <label className="block font-bold text-gray-700">Category</label>
                        </div>
                        <FormControl fullWidth sx={{ my: 1 }}>
                            <InputLabel id="quickbook-category-label" sx={{
                                background: 'linear-gradient(90deg,#f472b6,#60a5fa,#fde68a)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontWeight: 'bold',
                                pl: 1
                            }}>Select category</InputLabel>
                            <Select
                                labelId="quickbook-category-label"
                                value={catId ?? ''}
                                label="Select category"
                                onChange={e => setCatId(Number(e.target.value))}
                                sx={{
                                    borderRadius: 3,
                                    background: 'rgba(255,255,255,0.85)',
                                    boxShadow: 2,
                                    '& .MuiSelect-select': {
                                        py: 2,
                                        px: 2,
                                        fontWeight: 600,
                                        color: '#374151',
                                    },
                                    '& fieldset': {
                                        borderColor: '#f472b6',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#60a5fa',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#fde68a',
                                    },
                                }}
                            >
                                <MenuItem value="">
                                    <em>Select category</em>
                                </MenuItem>
                                {cats.map(c => (
                                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>

                    {catId && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <AttachMoneyIcon className="text-blue-500" />
                                <label className="block font-bold text-gray-700">Price</label>
                            </div>
                            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                                Suggestion: ${median.toFixed(2)} &plusmn;10% ({low.toFixed(2)}–{high.toFixed(2)})
                            </p>
                            <input
                                type="number"
                                className="w-full border-2 border-blue-200 p-3 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
                                value={price}
                                min={low}
                                max={high}
                                step={0.01}
                                onChange={e => setPrice(Number(e.target.value))}
                            />
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <ScheduleIcon className="text-yellow-500" />
                            <label className="block font-bold text-gray-700">Arrival Window</label>
                        </div>
                        <FormControl fullWidth sx={{ my: 1 }}>
                            <InputLabel id="quickbook-timeslot-label" sx={{
                                background: 'linear-gradient(90deg,#f472b6,#60a5fa,#fde68a)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontWeight: 'bold',
                                pl: 1
                            }}>Select 2-hr window</InputLabel>
                            <Select
                                labelId="quickbook-timeslot-label"
                                value={timeslot ?? ''}
                                label="Select 2-hr window"
                                onChange={e => setSlot(e.target.value)}
                                sx={{
                                    borderRadius: 3,
                                    background: 'rgba(255,255,255,0.85)',
                                    boxShadow: 2,
                                    '& .MuiSelect-select': {
                                        py: 2,
                                        px: 2,
                                        fontWeight: 600,
                                        color: '#374151',
                                    },
                                    '& fieldset': {
                                        borderColor: '#fde68a',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#60a5fa',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#f472b6',
                                    },
                                }}
                            >
                                <MenuItem value="">
                                    <em>Select 2-hr window</em>
                                </MenuItem>
                                {windows.map(w => (
                                    <MenuItem key={w.value} value={w.value}>{w.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                </div>

                <button
                    disabled={!canSubmit}
                    onClick={handleConfirm}
                    className="w-full py-3 bg-gradient-to-r from-pink-400 via-blue-400 to-yellow-300 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-lg"
                >
                    Confirm
                </button>
            </div>
        </div>
    );
}
