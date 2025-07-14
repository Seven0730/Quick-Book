'use client';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

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
        <FormControl fullWidth sx={{ my: 1 }}>
            <InputLabel id="timeslot-select-label" sx={{
                background: 'linear-gradient(90deg,#f472b6,#60a5fa,#fde68a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
                pl: 1
            }}>Select 2-hr window</InputLabel>
            <Select
                labelId="timeslot-select-label"
                value={value ?? ''}
                label="Select 2-hr window"
                onChange={e => onChange(e.target.value)}
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
                    <MenuItem key={w.value} value={w.value}>
                        {w.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
