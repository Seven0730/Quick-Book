'use client';
interface Props {
    value?: string;
    onChange: (slot: string) => void;
}

const windows = Array.from({ length: 12 }).map((_, i) => {
    const start = new Date();
    start.setHours(start.getHours() + 2 * i, 0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 2);
    return {
        label: `${start.getHours()}:00–${end.getHours()}:00`,
        value: `${start.toISOString()}/${end.toISOString()}`,
    };
});

export function TimeslotPicker({ value, onChange }: Props) {
    return (
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full border p-2 rounded"
        >
            <option value="">Select 2-hr window</option>
            {windows.map(w => (
                <option key={w.value} value={w.value}>
                    {w.label}
                </option>
            ))}
        </select>
    );
}
