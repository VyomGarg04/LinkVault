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
                <span className="text-xs text-slate-500 uppercase font-bold">Highlight Link</span>
                <button
                    type="button"
                    onClick={() => updateStyle('highlight', !style.highlight)}
                    className={`w-10 h-6 rounded-full relative transition-colors ${style.highlight ? 'bg-green-600' : 'bg-slate-700'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${style.highlight ? 'left-5' : 'left-1'}`} />
                </button>
            </div>

            {/* Controls Grid */}
            <div className="grid grid-cols-3 gap-3">

                {/* Color Controls */}
                <div className="col-span-3 grid grid-cols-2 gap-3 mt-2">
                    {/* Background Color */}
                    <div className="relative">
                        <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Background</label>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setActiveColorPicker(activeColorPicker === 'bgColor' ? null : 'bgColor')}
                                className="w-8 h-8 rounded-lg border border-slate-700 shadow-sm transition-transform hover:scale-105"
                                style={{ backgroundColor: style.bgColor || '#ffffff' }}
                            />
                            <div className="flex-1 relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">#</span>
                                <input
                                    type="text"
                                    value={(style.bgColor || '').replace('#', '')}
                                    onChange={(e) => updateStyle('bgColor', `#${e.target.value}`)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-5 pr-2 py-1.5 text-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                        {activeColorPicker === 'bgColor' && (
                            <div className="absolute z-20 mt-2">
                                <div className="fixed inset-0 z-0" onClick={() => setActiveColorPicker(null)} />
                                <div className="relative z-10">
                                    <HexColorPicker color={style.bgColor || '#ffffff'} onChange={(c) => updateStyle('bgColor', c)} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Text Color */}
                    <div className="relative">
                        <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Text</label>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setActiveColorPicker(activeColorPicker === 'textColor' ? null : 'textColor')}
                                className="w-8 h-8 rounded-lg border border-slate-700 shadow-sm transition-transform hover:scale-105"
                                style={{ backgroundColor: style.textColor || '#000000' }}
                            />
                            <div className="flex-1 relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">#</span>
                                <input
                                    type="text"
                                    value={(style.textColor || '').replace('#', '')}
                                    onChange={(e) => updateStyle('textColor', `#${e.target.value}`)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-5 pr-2 py-1.5 text-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                        {activeColorPicker === 'textColor' && (
                            <div className="absolute z-20 mt-2 right-0">
                                <div className="fixed inset-0 z-0" onClick={() => setActiveColorPicker(null)} />
                                <div className="relative z-10">
                                    <HexColorPicker color={style.textColor || '#000000'} onChange={(c) => updateStyle('textColor', c)} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Animation Select */}
                <div className="space-y-2">
                    <span className="text-xs text-slate-500 uppercase font-bold">Animation</span>
                    <select
                        value={style.animation || 'none'}
                        onChange={(e) => updateStyle('animation', e.target.value === 'none' ? undefined : e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="none">None</option>
                        <option value="glitch">Cyber Glitch</option>
                        <option value="breathe">Forest Breathe</option>
                        <option value="pulse">Soft Pulse</option>
                        <option value="beam">Beam</option>
                        <option value="neon-glow">Neon Glow</option>
                        <option value="shine">Shine</option>
                    </select>
                </div>

                {/* Preset Style */}
                <div className="space-y-2">
                    <span className="text-xs text-slate-500 uppercase font-bold flex items-center gap-2">
                        <Palette className="w-3 h-3" />
                        Preset
                    </span>
                    <select
                        value={style.preset || 'default'}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'default') {
                                setStyle({});
                                onChange('{}');
                            } else {
                                    const combos: Record<string, LinkStyle> = {
                                    gold: { highlight: true, bgColor: '#fbfbfb', textColor: '#d97706', animation: 'beam' },
                                    danger: { highlight: true, bgColor: '#fee2e2', textColor: '#ef4444', animation: 'pulse' },
                                    royal: { highlight: true, bgColor: '#1e1b4b', textColor: '#c7d2fe', animation: 'shine' },
                                    forest: { highlight: true, bgColor: '#ecfccb', textColor: '#3f6212', animation: 'breathe' },
                                    night: { highlight: true, bgColor: '#0f172a', textColor: '#f8fafc', animation: 'glow' }, // Midnight Blue
                                    neon: { highlight: true, bgColor: '#171717', textColor: '#a3e635', animation: 'neon-glow' }, // Lime Green
                                    ocean: { highlight: true, bgColor: '#0c4a6e', textColor: '#e0f2fe', animation: 'shine' },
                                    love: { highlight: true, bgColor: '#fce7f3', textColor: '#db2777', animation: 'heartbeat' },
                                    cyber: { highlight: true, bgColor: '#09090b', textColor: '#00ffff', animation: 'glitch' }, // Pure Cyber
                                };
                                const baseStyle = combos[val] || {};
                                const newStyle = { ...baseStyle, preset: val };
                                setStyle(newStyle);
                                onChange(JSON.stringify(newStyle));
                            }
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="default">Default</option>
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
                        Font
                    </span>
                    <select
                        value={style.fontFamily || ''}
                        onChange={(e) => updateStyle('fontFamily', e.target.value || undefined)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="">Default</option>
                        <option value="inter">Inter</option>
                        <option value="roboto">Roboto</option>
                        <option value="lato">Lato</option>
                        <option value="montserrat">Montserrat</option>
                        <option value="oswald">Oswald</option>
                        <option value="playfair">Playfair</option>
                        <option value="lobster">Lobster</option>
                        <option value="courier">Courier Prime</option>
                        <option value="bangers">Bangers</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
