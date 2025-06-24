'use client';
import { TIMESLOTS } from '@/constants/timeslots';

interface Props {
    value?: string;
    onChange?: (slot: string) => void;
}

export function TimeslotPicker({ value, onChange }: Props) {
    return (
        <select
            className="border p-2 rounded w-full"
            value={value ?? ''}
            onChange={e => onChange?.(e.target.value)}
        >
            <option value="">Select arrival window</option>
            {TIMESLOTS.map(slot => (
                <option key={slot} value={slot}>
                    {slot}
                </option>
            ))}
        </select>
    );
}
