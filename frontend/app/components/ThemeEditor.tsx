import { HexColorPicker } from 'react-colorful';
import { ThemeConfig, LinkItem } from '@/types';
import { Palette, Type, Wand2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import LinkStyleEditor from './LinkStyleEditor';

interface ThemeEditorProps {
    theme: ThemeConfig;
    onChange: (theme: ThemeConfig) => void;
    links?: LinkItem[];
    onLinkStyleChange?: (id: string, style: string) => void;
    onDraftUpdate?: (id: string | null, style: string | null) => void;
    onApplyPresetToLinks?: (style: string) => void;
}

const FONTS = [
    { id: 'inter', name: 'Inter (Modern)' },
    { id: 'roboto', name: 'Roboto (Clean)' },
    { id: 'lato', name: 'Lato (Friendly)' },
    { id: 'montserrat', name: 'Montserrat (Geometric)' },
    { id: 'oswald', name: 'Oswald (Bold)' },
    { id: 'playfair', name: 'Playfair (Elegant)' },
];

// Optimized ColorInput component defined outside to verify stability
const ColorInput = ({
    label,
    value,
    onChange,
    propKey,
    activePicker,
    onToggle
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    propKey: string;
    activePicker: string | null;
    onToggle: (key: string | null) => void;
}) => {
    // We use local state to ensure the input keying is smooth
    const [localValue, setLocalValue] = useState(value);

    // Sync from prop only when it changes (e.g. undo/reset)
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    return (
        <div className="relative">
            <label className="text-sm font-medium text-slate-400 mb-1 block">{label}</label>
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => onToggle(activePicker === propKey ? null : propKey as string)}
                    className="w-10 h-10 rounded-lg border border-slate-700 shadow-sm"
                    style={{ backgroundColor: localValue }}
                />
                <input
                    type="text"
                    value={localValue}
                    onChange={(e) => {
                        setLocalValue(e.target.value);
                        onChange(e.target.value);
                    }}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                />
            </div>
            {activePicker === propKey && (
                <div className="absolute z-10 mt-2">
                    <div className="fixed inset-0 z-0" onClick={() => onToggle(null)} />
                    <div className="relative z-10">
                        <HexColorPicker
                            color={localValue}
                            onChange={(c) => {
                                setLocalValue(c);
                                onChange(c);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default function ThemeEditor({ theme, onChange, links = [], onLinkStyleChange, onDraftUpdate, onApplyPresetToLinks }: ThemeEditorProps) {
    const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
    const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
    const [draftStyle, setDraftStyle] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [shouldApplyToAll, setShouldApplyToAll] = useState(false);

    // Effect to notify parent of draft changes for preview
    useEffect(() => {
        if (onDraftUpdate) {
            onDraftUpdate(selectedLinkId, draftStyle);
        }
    }, [selectedLinkId, draftStyle, onDraftUpdate]);

    const handleColorChange = (key: keyof ThemeConfig, color: string) => {
        onChange({ ...theme, [key]: color });
    };



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
                    <ColorInput
                        label="Background Color"
                        propKey="bgColor"
                        value={theme.bgColor as string}
                        onChange={(c) => handleColorChange('bgColor', c)}
                        activePicker={activeColorPicker}
                        onToggle={setActiveColorPicker}
                    />
                    <ColorInput
                        label="Text Color"
                        propKey="textColor"
                        value={theme.textColor as string}
                        onChange={(c) => handleColorChange('textColor', c)}
                        activePicker={activeColorPicker}
                        onToggle={setActiveColorPicker}
                    />

                </div>
            </div>

            {/* Global Link Styles */}
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2 text-slate-200">
                        <Palette className="w-5 h-5 text-amber-500" />
                        <span>Global Link Styles</span>
                    </h3>
                    <label className="flex items-center space-x-2 cursor-pointer group">
                        <span className={`text-xs font-medium transition-colors ${shouldApplyToAll ? 'text-green-400' : 'text-slate-500 group-hover:text-slate-300'}`}>Apply to all links</span>
                        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${shouldApplyToAll ? 'bg-green-500' : 'bg-slate-700'}`}>
                            <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${shouldApplyToAll ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                        <input
                            type="checkbox"
                            checked={shouldApplyToAll}
                            onChange={(e) => setShouldApplyToAll(e.target.checked)}
                            className="hidden"
                        />
                    </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-900/30 p-4 rounded-xl border border-slate-800">

                    {/* Preset */}
                    <div className="space-y-3">
                        <span className="text-xs text-slate-500 uppercase font-bold">Preset Style</span>
                        <select
                            value={theme.preset || 'default'}
                            onChange={(e) => {
                                const val = e.target.value;
                                let newTheme = { ...theme };
                                let styleToApply = null;

                                if (val === 'default') {
                                    newTheme = { ...theme, preset: undefined };
                                } else {
                                    const combos: any = {
                                        gold: { buttonBgColor: '#fbfbfb', buttonTextColor: '#d97706', animation: 'beam' },
                                        danger: { buttonBgColor: '#fee2e2', buttonTextColor: '#ef4444', animation: 'pulse' },
                                        royal: { buttonBgColor: '#1e1b4b', buttonTextColor: '#c7d2fe', animation: 'shine' },
                                        forest: { buttonBgColor: '#ecfccb', buttonTextColor: '#3f6212', animation: 'breathe' },
                                        night: { buttonBgColor: '#0f172a', buttonTextColor: '#f8fafc', animation: 'glow' },
                                        neon: { buttonBgColor: '#171717', buttonTextColor: '#a3e635', animation: 'neon-glow' },
                                        ocean: { buttonBgColor: '#0c4a6e', buttonTextColor: '#e0f2fe', animation: 'shine' },
                                        love: { buttonBgColor: '#fce7f3', buttonTextColor: '#db2777', animation: 'heartbeat' },
                                        cyber: { buttonBgColor: '#09090b', buttonTextColor: '#00ffff', animation: 'beam' },
                                    };
                                    const baseStyle = combos[val] || {};
                                    newTheme = { ...theme, ...baseStyle, preset: val };

                                    // Prepare style string for links
                                    if (shouldApplyToAll && onApplyPresetToLinks) {
                                        styleToApply = JSON.stringify({
                                            bgColor: baseStyle.buttonBgColor,
                                            textColor: baseStyle.buttonTextColor,
                                            animation: baseStyle.animation
                                        });
                                        onApplyPresetToLinks(styleToApply);
                                    }
                                }
                                onChange(newTheme);
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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

                    {/* Animation */}
                    <div className="space-y-2">
                        <span className="text-xs text-slate-500 uppercase font-bold">Animation</span>
                        <select
                            value={theme.animation || 'none'}
                            onChange={(e) => {
                                const newAnim = e.target.value === 'none' ? undefined : e.target.value;
                                if (shouldApplyToAll && onApplyPresetToLinks) {
                                    onApplyPresetToLinks(JSON.stringify({
                                        bgColor: theme.buttonBgColor,
                                        textColor: theme.buttonTextColor,
                                        animation: newAnim
                                    }));
                                }
                                onChange({ ...theme, animation: newAnim as any });
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="none">None</option>
                            <option value="glitch">Cyber Glitch</option>
                            <option value="breathe">Forest Breathe</option>
                            <option value="pulse">Soft Pulse</option>
                            <option value="beam">Beam</option>
                            <option value="neon-glow">Neon Glow</option>
                            <option value="heartbeat">Heartbeat</option>
                            <option value="shine">Shine</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Individual Link Styles (Overrides) */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2 text-slate-200">
                    <Wand2 className="w-5 h-5 text-pink-500" />
                    <span>Individual Link Overrides</span>
                </h3>
                <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800 space-y-4">
                    <div className="space-y-2">
                        <span className="text-xs text-slate-500 uppercase font-bold">Select a Link to Customize</span>
                        <select
                            value={selectedLinkId || ''}
                            onChange={(e) => {
                                setSelectedLinkId(e.target.value || null);
                                setDraftStyle(null);
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="">-- Choose a link to override --</option>
                            {links.map(link => (
                                <option key={link.id} value={link.id}>
                                    🔗 {link.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedLinkId && onLinkStyleChange && (() => {
                        const link = links.find(l => l.id === selectedLinkId);
                        if (!link) return null;

                        const currentStyle = draftStyle || link.style || '{}';
                        const hasChanges = draftStyle && draftStyle !== link.style;

                        return (
                            <div className="animate-in fade-in slide-in-from-top-2 border-t border-slate-800 pt-4 space-y-4">
                                <LinkStyleEditor
                                    value={currentStyle}
                                    onChange={(val) => setDraftStyle(val)}
                                />
                                <div className="flex justify-end">
                                    <button
                                        onClick={async () => {
                                            if (draftStyle) {
                                                setIsSaving(true);
                                                try {
                                                    await onLinkStyleChange(link.id, draftStyle);
                                                } finally {
                                                    setIsSaving(false);
                                                }
                                            }
                                        }}
                                        disabled={!hasChanges || isSaving}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${hasChanges && !isSaving
                                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                            }`}
                                    >
                                        {isSaving ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin"></span>
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            hasChanges ? 'Save Changes' : 'Saved'
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Preview Hint */}
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-sm text-indigo-300">
                Tip: Check the live preview on the right to see your changes!
            </div>
        </div>
    );
}
