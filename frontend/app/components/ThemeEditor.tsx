import { HexColorPicker } from 'react-colorful';
import { ThemeConfig } from '@/types';
import { Palette, Type } from 'lucide-react';
import { useState } from 'react';

interface ThemeEditorProps {
    theme: ThemeConfig;
    onChange: (theme: ThemeConfig) => void;
}

const FONTS = [
    { id: 'inter', name: 'Inter (Modern)' },
    { id: 'roboto', name: 'Roboto (Clean)' },
    { id: 'lato', name: 'Lato (Friendly)' },
    { id: 'montserrat', name: 'Montserrat (Geometric)' },
    { id: 'oswald', name: 'Oswald (Bold)' },
    { id: 'playfair', name: 'Playfair (Elegant)' },
];

export default function ThemeEditor({ theme, onChange }: ThemeEditorProps) {
    const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

    const handleColorChange = (key: keyof ThemeConfig, color: string) => {
        onChange({ ...theme, [key]: color });
    };

    const ColorInput = ({ label, propKey }: { label: string, propKey: keyof ThemeConfig }) => (
        <div className="relative">
            <label className="text-sm font-medium text-slate-400 mb-1 block">{label}</label>
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => setActiveColorPicker(activeColorPicker === propKey ? null : propKey as string)}
                    className="w-10 h-10 rounded-lg border border-slate-700 shadow-sm"
                    style={{ backgroundColor: theme[propKey] as string }}
                />
                <input
                    type="text"
                    value={theme[propKey] as string}
                    onChange={(e) => handleColorChange(propKey, e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                />
            </div>
            {activeColorPicker === propKey && (
                <div className="absolute z-10 mt-2">
                    <div className="fixed inset-0 z-0" onClick={() => setActiveColorPicker(null)} />
                    <div className="relative z-10">
                        <HexColorPicker color={theme[propKey] as string} onChange={(c) => handleColorChange(propKey, c)} />
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Fonts */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2 text-slate-200">
                    <Type className="w-5 h-5 text-indigo-500" />
                    <span>Typography</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {FONTS.map((font) => (
                        <button
                            key={font.id}
                            onClick={() => onChange({ ...theme, fontFamily: font.id })}
                            className={`p-3 rounded-xl border text-left transition-all ${theme.fontFamily === font.id
                                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600'
                                }`}
                        >
                            <span className="font-medium">{font.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Colors */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2 text-slate-200">
                    <Palette className="w-5 h-5 text-purple-500" />
                    <span>Colors</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-900/30 p-4 rounded-xl border border-slate-800">
                    <ColorInput label="Background Color" propKey="bgColor" />
                    <ColorInput label="Text Color" propKey="textColor" />
                    <ColorInput label="Button Background" propKey="buttonBgColor" />
                    <ColorInput label="Button Text" propKey="buttonTextColor" />
                </div>
            </div>

            {/* Preview Hint */}
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-sm text-indigo-300">
                Tip: Check the live preview on the right to see your changes!
            </div>
        </div>
    );
}
