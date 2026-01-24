import { useState, useRef, useEffect } from "react";
import { ChevronDown, Clock, Check } from "lucide-react";

interface TimePickerProps {
    value: string; // HH:mm format (24h)
    onChange: (value: string) => void;
}

export default function TimePicker({ value, onChange }: TimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse value to 12h format for display/selection
    const [hours24, minutes] = value.split(':').map(Number);
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12;

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minuteOptions = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0')); // Every 5 mins
    const periods = ['AM', 'PM'];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (newH12: number, newMin: string, newPeriod: string) => {
        let newH24 = newH12;
        if (newPeriod === 'PM' && newH12 !== 12) newH24 += 12;
        if (newPeriod === 'AM' && newH12 === 12) newH24 = 0;

        onChange(`${newH24.toString().padStart(2, '0')}:${newMin}`);
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center space-x-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 hover:bg-slate-800 transition-colors w-36 justify-between ${isOpen ? 'ring-1 ring-indigo-500 border-indigo-500' : ''}`}
            >
                <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="font-mono whitespace-nowrap">{hours12.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')} {period}</span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-4 flex space-x-2 animate-in fade-in zoom-in-95">
                    {/* Hours */}
                    <div className="flex flex-col h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent pr-1 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 text-center mb-1 sticky top-0 bg-slate-950">HR</span>
                        {hours.map(h => (
                            <button
                                key={h}
                                onClick={() => handleChange(h, minutes.toString().padStart(2, '0'), period)}
                                className={`w-10 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors ${hours12 === h ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
                            >
                                {h}
                            </button>
                        ))}
                    </div>

                    <div className="w-px bg-slate-800 mx-1" />

                    {/* Minutes */}
                    <div className="flex flex-col h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent pr-1 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 text-center mb-1 sticky top-0 bg-slate-950">MIN</span>
                        {minuteOptions.map(m => (
                            <button
                                key={m}
                                onClick={() => handleChange(hours12, m, period)}
                                className={`w-10 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors ${minutes.toString().padStart(2, '0') === m ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    <div className="w-px bg-slate-800 mx-1" />

                    {/* AM/PM */}
                    <div className="flex flex-col space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 text-center mb-1">AM/PM</span>
                        {periods.map(p => (
                            <button
                                key={p}
                                onClick={() => handleChange(hours12, minutes.toString().padStart(2, '0'), p)}
                                className={`w-12 h-8 rounded flex items-center justify-center text-xs font-bold transition-colors ${period === p ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
