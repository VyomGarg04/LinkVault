import { useState, useEffect } from 'react';
import { LinkStyle } from '@/types';
import { Sparkles, Type, Palette } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

interface LinkStyleEditorProps {
    value: string; // JSON string
    onChange: (value: string) => void;
}

export default function LinkStyleEditor({ value, onChange }: LinkStyleEditorProps) {
    const [style, setStyle] = useState<LinkStyle>({});

    useEffect(() => {
        try {
            if (value) setStyle(JSON.parse(value));
        } catch (e) {
            setStyle({});
        }
    }, [value]);

    const updateStyle = (key: keyof LinkStyle, val: any) => {
        const newStyle = { ...style, [key]: val };
        setStyle(newStyle);
        onChange(JSON.stringify(newStyle));
    };

    const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

    return (
        <div className="space-y-4 p-4 bg-slate-950/50 rounded-xl border border-slate-700">
            <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Custom Styles
            </h4>

            {/* Highlight Toggle */}
            <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Highlight Link</span>
                <button
                    type="button"
                    onClick={() => updateStyle('highlight', !style.highlight)}
                    className={`w-10 h-6 rounded-full relative transition-colors ${style.highlight ? 'bg-green-600' : 'bg-slate-700'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${style.highlight ? 'left-5' : 'left-1'}`} />
                </button>
            </div>

            {/* Animation Select */}
            <div className="space-y-2">
                <span className="text-xs text-slate-500 uppercase font-bold">Animation</span>
                <div className="grid grid-cols-4 gap-2">
                    {['none', 'pulse', 'float', 'glow'].map((anim) => (
                        <button
                            key={anim}
                            type="button"
                            onClick={() => updateStyle('animation', anim === 'none' ? undefined : anim)}
                            className={`px-2 py-1 text-xs rounded-md border transition-all ${style.animation === anim || (!style.animation && anim === 'none')
                                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                        >
                            {anim}
                        </button>
                    ))}
                </div>
            </div>

            {/* Presets and Font Row */}
            <div className="grid grid-cols-2 gap-4">
                {/* Style Presets */}
                <div className="space-y-2">
                    <span className="text-xs text-slate-500 uppercase font-bold flex items-center gap-2">
                        <Palette className="w-3 h-3" />
                        Preset Style
                    </span>
                    <select
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'default') {
                                setStyle({});
                                onChange('{}');
                            } else {
                                const combos: Record<string, LinkStyle> = {
                                    gold: { highlight: true, bgColor: '#fbfbfb', textColor: '#d97706' },
                                    danger: { highlight: true, bgColor: '#fee2e2', textColor: '#ef4444' },
                                    royal: { highlight: true, bgColor: '#1e1b4b', textColor: '#c7d2fe' },
                                    forest: { highlight: true, bgColor: '#ecfccb', textColor: '#3f6212' },
                                    night: { highlight: true, bgColor: '#000000', textColor: '#ffffff' },
                                    neon: { highlight: true, bgColor: '#171717', textColor: '#22c55e', animation: 'glow' },
                                    ocean: { highlight: true, bgColor: '#0c4a6e', textColor: '#e0f2fe' },
                                    love: { highlight: true, bgColor: '#fce7f3', textColor: '#db2777' },
                                    cyber: { highlight: true, bgColor: '#000000', textColor: '#06b6d4' },
                                };
                                const newStyle = combos[val] || {};
                                setStyle(newStyle);
                                onChange(JSON.stringify(newStyle));
                            }
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="">Select a Preset...</option>
                        <option value="default">Default (Reset)</option>
                        <option value="gold">🟡 Gold</option>
                        <option value="danger">🔴 Danger</option>
                        <option value="royal">👑 Royal</option>
                        <option value="forest">🌲 Forest</option>
                        <option value="night">🌑 Night</option>
                        <option value="neon">⚡ Neon</option>
                        <option value="ocean">🌊 Ocean</option>
                        <option value="love">💖 Love</option>
                        <option value="cyber">🤖 Cyber</option>
                    </select>
                </div>

                {/* Custom Font Override */}
                <div className="space-y-2">
                    <span className="text-xs text-slate-500 uppercase font-bold flex items-center gap-2">
                        <Type className="w-3 h-3" />
                        Font Override
                    </span>
                    <select
                        value={style.fontFamily || ''}
                        onChange={(e) => updateStyle('fontFamily', e.target.value || undefined)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="">Default (Theme)</option>
                        <option value="inter">Inter</option>
                        <option value="roboto">Roboto</option>
                        <option value="lato">Lato</option>
                        <option value="montserrat">Montserrat</option>
                        <option value="oswald">Oswald</option>
                        <option value="playfair">Playfair Display</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
