'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { LinkHub } from '@/types';
import Link from 'next/link';
import { ArrowLeft, GripVertical, Trash2, ExternalLink, Plus, Camera, X, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import RuleEditor from '@/app/components/RuleEditor'; // Import RuleEditor
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableLinkItem } from '@/app/components/SortableLinkItem';
import { getFaviconUrl } from '@/lib/utils';
import ThemeEditor from '@/app/components/ThemeEditor';
import ShareModal from '@/app/components/ShareModal';
import LinkStyleEditor from '@/app/components/LinkStyleEditor';
import HubSettingsModal from '@/app/components/HubSettingsModal';
import { ThemeConfig, LinkItem, LinkStyle } from '@/types';
import { Share2, Palette, Wand2, Settings, User, Smartphone, Monitor } from 'lucide-react';

// Schemas

// Schemas
const linkSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    url: z.string().url('Must be a valid URL'),
    icon: z.string().optional(),
    style: z.string().optional(),
});

type LinkFormData = z.infer<typeof linkSchema>;

const AVATAR_OPTIONS = [
    'https://api.dicebear.com/7.x/micah/svg?seed=Alex&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/micah/svg?seed=Felix=sad&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/lorelei/svg?seed=Sasha=smile&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/lorelei/svg?seed=Kyle=smile&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/lorelei/svg?seed=Maria=sad&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Vault&backgroundColor=0d1117&primaryColor=9a7cf6',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Charlie&backgroundColor=e6e6e6',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Cypher&backgroundColor=0b2229&primaryColor=16b6d4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix=excite&backgroundColor=b6a3f4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&mouth=smile&backgroundColor=ffdfbf',
];



export default function HubEditorPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        // User check handling is done via hook/middleware logic mostly
    }, [user]);
    const [hub, setHub] = useState<LinkHub | null>(null);
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [rules, setRules] = useState<any[]>([]); // Rules State
    const [draftRule, setDraftRule] = useState<any | null>(null); // Draft Rule State for Preview
    const [loading, setLoading] = useState(true);
    const [isAddingLink, setIsAddingLink] = useState(false);
    const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<ThemeConfig>({
        bgColor: '#020617',
        textColor: '#ffffff',
        buttonBgColor: '#0f172a',
        buttonTextColor: '#ffffff',
        fontFamily: 'inter',
    });
    const [activeTab, setActiveTab] = useState<'links' | 'rules' | 'appearance'>('links');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
    const [editFormTab, setEditFormTab] = useState<'settings' | 'styles'>('settings');
    const [draftLinkStyle, setDraftLinkStyle] = useState<{ id: string | null, style: string | null }>({ id: null, style: null });

    const themeSaveTimeout = useRef<NodeJS.Timeout | null>(null);
    const linkStyleSaveTimeout = useRef<NodeJS.Timeout | null>(null);

    // Form handling
    const { register, handleSubmit, reset, control, watch, formState: { errors, isSubmitting } } = useForm<LinkFormData>({
        resolver: zodResolver(linkSchema),
    });

    // Fetch Data
    useEffect(() => {
        if (user && params.id) {
            const fetchData = async () => {
                try {
                    const res = await api.get(`/hubs/${params.id}`);
                    const { hub } = res.data;

                    setHub(hub);
                    setLinks(hub.links || []);
                    setRules(hub.rules || []);

                    try {
                        const parsed = typeof hub.theme === 'string'
                            ? JSON.parse(hub.theme)
                            : hub.theme || {};
                        setCurrentTheme({
                            bgColor: '#020617',
                            textColor: '#ffffff',
                            buttonBgColor: '#0f172a',
                            buttonTextColor: '#ffffff',
                            fontFamily: 'inter',
                            ...parsed
                        });
                    } catch (e) {
                        console.error("Failed to parse theme", e);
                        setCurrentTheme({
                            bgColor: '#020617',
                            textColor: '#ffffff',
                            buttonBgColor: '#0f172a',
                            buttonTextColor: '#ffffff',
                            fontFamily: 'inter',
                        });
                    }
                } catch (error) {
                    toast.error('Failed to load hub data');
                    router.push('/dashboard');
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [user, params.id, router]);

    // Dnd Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Auth Check
    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
    }, [authLoading, user, router]);


    // Handlers
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setLinks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Optimistic Update: Send new order to backend
                // The position is 0-indexed based on array order
                const updates = newItems.map((item, index) => ({
                    id: item.id,
                    position: index
                }));

                api.put('/links/reorder', { links: updates }).catch(err => {
                    toast.error("Failed to save order");
                    // Revert? For now usually logic is complex to revert, assume success or reload
                });

                return newItems;
            });
        }
    };
    const onSaveLink = async (data: LinkFormData) => {
        try {
            if (editingLink) {
                const res = await api.put(`/links/${editingLink.id}`, data);
                setLinks(links.map(l => l.id === editingLink.id ? res.data.link : l));
                toast.success('Link updated');
                setEditingLink(null);
            } else {
                const res = await api.post(`/hubs/${params.id}/links`, data);
                setLinks([...links, res.data.link]);
                toast.success('Link added');
                setIsAddingLink(false);
            }
            reset({ title: '', url: '', icon: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save link');
        }
    };

    const onEditLink = (link: LinkItem) => {
        setEditingLink(link);
        setIsAddingLink(false);
        setEditFormTab('settings');
        reset({
            title: link.title,
            url: link.url,
            icon: link.icon || '',
            style: link.style || '{}'
        });
    };

    const onDeleteLink = async (id: string) => {
        if (!confirm('Are you sure you want to delete this link?')) return;
        try {
            await api.delete(`/links/${id}`);
            setLinks(links.filter(l => l.id !== id));
            toast.success('Link deleted');
        } catch (error) {
            toast.error('Failed to delete link');
        }
    };

    const onToggleActive = async (link: LinkItem) => {
        try {
            const updated = { ...link, isActive: !link.isActive };
            await api.put(`/links/${link.id}`, { isActive: updated.isActive });
            setLinks(links.map(l => l.id === link.id ? updated : l));
            toast.success('Updated');
        } catch (error) {
            toast.error('Failed to update');
        }
    }

    const onUpdateAvatar = async (avatarUrl: string) => {
        try {
            const newTheme = { ...currentTheme, avatar: avatarUrl };
            await api.put(`/hubs/${params.id}`, { theme: JSON.stringify(newTheme) });
            setCurrentTheme(newTheme);
            setShowAvatarPicker(false);
            toast.success('Avatar updated');
        } catch (error) {
            toast.error('Failed to update avatar');
        }
    }

    const onThemeChange = (newTheme: ThemeConfig) => {
        setCurrentTheme(newTheme);

        if (themeSaveTimeout.current) clearTimeout(themeSaveTimeout.current);

        themeSaveTimeout.current = setTimeout(async () => {
            try {
                await api.put(`/hubs/${params.id}`, { theme: JSON.stringify(newTheme) });
            } catch (error) {
                console.error('Failed to save theme', error);
            }
        }, 500);
    };

    const onUpdateLinkStyle = (linkId: string, style: string) => {
        // Optimistic update
        setLinks(prev => prev.map(l => l.id === linkId ? { ...l, style } : l));
        
        if (linkStyleSaveTimeout.current) clearTimeout(linkStyleSaveTimeout.current);

        linkStyleSaveTimeout.current = setTimeout(async () => {
            try {
                await api.put(`/links/${linkId}`, { style });
            } catch (error) {
                console.error('Failed to update link style', error);
                toast.error('Failed to save style');
            }
        }, 500);
    };

    const onApplyPresetToLinks = async (style: string) => {
        if (!confirm('Apply this style to all existing links? This will overwrite individual customizations.')) return;

        try {
            // Optimistic update
            const updatedLinks = links.map(l => ({ ...l, style }));
            setLinks(updatedLinks);

            // Single Batch API call
            await api.put(`/hubs/${params.id}/links/style`, { style });

            toast.success('All links updated');
        } catch (error) {
            console.error('Failed to batch update', error);
            toast.error('Failed to update all links on server');
        }
    };

    const handleDraftUpdate = useCallback((id: string | null, style: string | null) => {
        setDraftLinkStyle({ id, style });
    }, []);

    if (loading || !hub) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-green-500">Loading Editor...</div>
    }

    return (
        <div className="min-h-screen text-white flex flex-col relative w-full h-full">
            {/* Avatar Picker Modal */}
            {showAvatarPicker && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative overflow-hidden">
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <div className="flex items-center space-x-2">
                                <User className="w-5 h-5 text-indigo-500" />
                                <h3 className="text-xl font-bold text-white">Choose Avatar</h3>
                            </div>
                            <button onClick={() => setShowAvatarPicker(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                            {/* Custom Upload Section */}
                            <div className="space-y-3 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Custom Upload</h4>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <label className="flex-1 cursor-pointer group relative overflow-hidden rounded-lg bg-zinc-900 border border-zinc-700 hover:border-indigo-500 transition-all p-3 flex flex-col items-center justify-center text-center space-y-2">
                                        <Camera className="w-6 h-6 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                                        <span className="text-xs text-slate-400 group-hover:text-indigo-300">Upload Image</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    if (file.size > 1024 * 1024) {
                                                        toast.error("Image too large (Max 1MB)");
                                                        return;
                                                    }
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        onUpdateAvatar(reader.result as string);
                                                        setShowAvatarPicker(false);
                                                        toast.success("Custom avatar uploaded!");
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </label>
                                    <div className="flex-1 flex flex-col justify-center space-y-2">
                                        <span className="text-xs text-slate-500">Or paste an external URL</span>
                                        <div className="flex rounded-lg overflow-hidden border border-zinc-700 focus-within:border-indigo-500 transition-colors">
                                            <input
                                                type="text"
                                                placeholder="https://example.com/me.jpg"
                                                className="w-full bg-zinc-900 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const val = e.currentTarget.value;
                                                        if (val) {
                                                            onUpdateAvatar(val);
                                                            setShowAvatarPicker(false);
                                                            toast.success("Avatar URL updated!");
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-zinc-800" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-zinc-950 px-2 text-slate-500">Or choose a preset</span>
                                </div>
                            </div>

                            {/* Presets Grid */}
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                {AVATAR_OPTIONS.map((url, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            onUpdateAvatar(url);
                                            setShowAvatarPicker(false);
                                        }}
                                        className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 hover:border-indigo-500 hover:shadow-indigo-500/20 transition-all hover:scale-105"
                                        title="Select Avatar"
                                    >
                                        <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/10 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl px-4 py-3 sticky top-0 z-50 w-full">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-lg font-bold">{hub.title}</h1>
                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${hub.isActive
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                    {hub.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="text-xs text-slate-500 flex items-center space-x-2">
                                <span>/{hub.slug}</span>
                                {user?.username && hub.isActive && (
                                    <a href={`/${user.username}/${hub.slug}`} target="_blank" rel="noopener noreferrer" className="hover:text-green-400">
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        {/* Status Toggle */}
                        <div className="flex items-center gap-2 mr-2 border-r border-slate-700 pr-4">
                            <span className="text-xs font-bold text-slate-400 uppercase">{hub.isActive ? 'Online' : 'Offline'}</span>
                            <button
                                onClick={async () => {
                                    try {
                                        const newStatus = !hub.isActive;
                                        setHub({ ...hub, isActive: newStatus });
                                        await api.put(`/hubs/${hub.id}`, { isActive: newStatus });
                                        toast.success(newStatus ? 'Hub Online' : 'Hub Offline');
                                    } catch (e) {
                                        setHub({ ...hub, isActive: !hub.isActive }); // Revert
                                        toast.error("Failed to update status");
                                    }
                                }}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${hub.isActive ? 'bg-green-500' : 'bg-slate-700'}`}
                                role="switch"
                                aria-checked={hub.isActive}
                            >
                                <span className="sr-only">Use setting</span>
                                <span
                                    aria-hidden="true"
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${hub.isActive ? 'translate-x-5' : 'translate-x-0'}`}
                                />
                            </button>
                        </div>

                        <button
                            onClick={() => setIsShareModalOpen(true)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Share Hub"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setIsSettingsModalOpen(true)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Hub Settings"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <Link href="/dashboard/settings" title="Account Settings" className="w-9 h-9 flex items-center justify-center bg-slate-800 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors">
                            <User className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </nav>

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                url={hub && user ? `${window.location.origin}/${user.username}/${hub.slug}` : ''}
                title={hub.title}
            />

            <HubSettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                hub={hub}
                onUpdate={(updated) => setHub(updated)}
            />

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col md:flex-row gap-8">

                {/* Editor Column */}
                <div className="flex-1 space-y-6 min-w-0">
                    {/* Tabs */}
                    <div className="flex space-x-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800 w-fit">
                        <button
                            onClick={() => setActiveTab('links')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'links' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Links
                        </button>
                        <button
                            onClick={() => setActiveTab('rules')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'rules' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Rules
                        </button>
                        <button
                            onClick={() => setActiveTab('appearance')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'appearance' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Appearance
                        </button>
                    </div>

                    {activeTab === 'links' ? (
                        <>
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Links</h2>
                                <button
                                    onClick={() => {
                                        setIsAddingLink(true);
                                        setEditingLink(null);
                                        setEditFormTab('settings');
                                        reset({ title: '', url: '', icon: '' });
                                    }}
                                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-green-900/20"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Link</span>
                                </button>
                            </div>

                            {/* Add/Edit Link Form */}
                            {(isAddingLink || editingLink) && (
                                <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-4">
                                    <h3 className="font-semibold text-slate-300">{editingLink ? 'Edit Link' : 'New Link'}</h3>

                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-400">Title</label>
                                            <input
                                                {...register('title')}
                                                placeholder="Link Title (e.g. My Instagram)"
                                                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            />
                                            {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-400">URL</label>
                                            <input
                                                {...register('url')}
                                                placeholder="URL (https://...)"
                                                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                            />
                                            {errors.url && <p className="text-red-400 text-xs">{errors.url.message}</p>}
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => {
                                                setIsAddingLink(false);
                                                setEditingLink(null);
                                                reset();
                                            }}
                                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmit(onSaveLink, (errors) => {
                                                console.error("Validation Errors:", errors);
                                                toast.error("Please check the form for errors");
                                            })}
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                                        >
                                            {editingLink ? 'Update' : 'Add'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Links List */}
                            <div className="space-y-3">
                                {links.length === 0 && !isAddingLink && (
                                    <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                                        No links yet. Add one to get started!
                                    </div>
                                )}
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={links.map(l => l.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {links.map((link) => (
                                            <SortableLinkItem
                                                key={link.id}
                                                link={link}
                                                onToggleActive={onToggleActive}
                                                onEditLink={onEditLink}
                                                onDeleteLink={onDeleteLink}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            </div>
                        </>
                    ) : activeTab === 'rules' ? (
                        <RuleEditor
                            hubId={params.id as string}
                            links={links}
                            onRulesChange={(updatedRules) => setRules(updatedRules)} // Callback to update preview
                        />
                    ) : (
                        <ThemeEditor
                            theme={currentTheme}
                            onChange={onThemeChange}
                            links={links}
                            onLinkStyleChange={onUpdateLinkStyle}
                            onDraftUpdate={handleDraftUpdate}
                            onApplyPresetToLinks={onApplyPresetToLinks}
                        />
                    )}
                </div>

                {/* Preview Column */}
                <div className={`shrink-0 transition-all duration-500 ease-in-out ${previewMode === 'mobile' ? 'w-full md:w-[320px]' : 'w-full md:w-[600px]'}`}>
                    <div className="sticky top-24">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Preview</h2>
                            <div className="bg-slate-900 border border-slate-700 rounded-lg p-1 flex">
                                <button
                                    onClick={() => setPreviewMode('mobile')}
                                    className={`p-1.5 rounded-md transition-all ${previewMode === 'mobile' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                    title="Mobile View"
                                >
                                    <Smartphone className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setPreviewMode('desktop')}
                                    className={`p-1.5 rounded-md transition-all ${previewMode === 'desktop' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                    title="Desktop View"
                                >
                                    <Monitor className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Preview Frame */}
                        <div
                            className={`transition-all duration-500 ease-in-out bg-slate-900 shadow-2xl overflow-hidden relative mx-auto ${previewMode === 'mobile'
                                ? 'w-full aspect-[9/19.5] border-[12px] border-slate-800 rounded-[3rem]'
                                : 'w-full aspect-[16/10] rounded-xl border border-slate-700/50 mb-auto'
                                }`}
                        >
                            {/* Desktop Browser Bar (Only visible in desktop mode) */}
                            {previewMode === 'desktop' && (
                                <div className="h-8 bg-slate-800 border-b border-slate-700 flex items-center px-4 space-x-2">
                                    <div className="flex space-x-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="flex-1 flex justify-center px-4">
                                        <div className="bg-slate-900/50 rounded-md w-full max-w-[200px] h-5 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                                            linkvault.io/{hub.slug}
                                        </div>
                                    </div>
                                    <div className="w-10"></div> {/* Spacer */}
                                </div>
                            )}

                            {/* Simulated Screen */}
                            <div
                                className={`absolute left-0 w-full overflow-y-auto flex flex-col items-center transition-colors duration-300 ${previewMode === 'desktop' ? 'top-8 h-[calc(100%-2rem)]' : 'top-0 h-full p-6'}`}
                                style={{
                                    backgroundColor: currentTheme.bgColor,
                                    color: currentTheme.textColor,
                                    fontFamily: {
                                        inter: 'var(--font-inter)',
                                        roboto: 'var(--font-roboto)',
                                        playfair: 'var(--font-playfair)',
                                        lato: 'var(--font-lato)',
                                        oswald: 'var(--font-oswald)',
                                        montserrat: 'var(--font-montserrat)',
                                    }[currentTheme.fontFamily] || 'var(--font-inter)',
                                    scrollbarWidth: 'none', // Firefox
                                    msOverflowStyle: 'none'  // IE/Edge
                                }}
                            >
                                <style jsx>{`
                                    div::-webkit-scrollbar {
                                        display: none;
                                    }
                                `}</style>
                                {/* Desktop Background Elements simulation */}
                                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

                                <div className={`relative z-10 w-full flex flex-col items-center ${previewMode === 'desktop' ? 'py-12' : ''}`}>
                                    {/* Avatar Section */}
                                    <div className="relative group/avatar cursor-pointer mb-6" onClick={() => setShowAvatarPicker(true)}>
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-700/50 group-hover/avatar:border-white transition-colors shadow-xl bg-slate-800 flex items-center justify-center relative z-10">
                                            {currentTheme.avatar ? (
                                                <img src={currentTheme.avatar} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-3xl font-bold opacity-50 text-slate-400">{hub.title.charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full shadow-lg opacity-80 group-hover/avatar:opacity-100 transition-all transform translate-y-2 group-hover/avatar:translate-y-0 z-20">
                                            <Camera className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-xl mb-1 text-center px-4" style={{ color: currentTheme.textColor }}>{hub.title}</h3>
                                    <p className="text-sm text-center mb-8 px-4 opacity-70" style={{ color: currentTheme.textColor }}>{hub.description}</p>

                                    <div className={`w-full space-y-3 px-2 ${previewMode === 'desktop' ? 'max-w-md' : ''}`}>
                                        {(() => {
                                            // 1. Start with Active Links
                                            let visibleLinkIds = new Set(links.filter(l => l.isActive).map(l => l.id));

                                            // 2. Apply Rules (Client-Side Simulation)
                                            // Mix in Draft Rule if exists
                                            let activeRules = [...rules];
                                            if (draftRule) {
                                                if (draftRule.id) {
                                                    activeRules = activeRules.map(r => r.id === draftRule.id ? { ...r, ...draftRule } : r);
                                                } else {
                                                    // New rule needs ID to be safe, but local sim ok
                                                    activeRules.push({ ...draftRule, isActive: draftRule.isActive ?? true, priority: draftRule.priority ?? 0 });
                                                }
                                            }

                                            // Sort rules by priority (desc)
                                            const sortedRules = activeRules.filter(r => r.isActive).sort((a, b) => (b.priority || 0) - (a.priority || 0));

                                            sortedRules.forEach(rule => {
                                                // Evaluate Conditions
                                                let conditionsMet = true;
                                                // Safe Parsing
                                                let conditions = [];
                                                try { conditions = typeof rule.conditions === 'string' ? JSON.parse(rule.conditions) : rule.conditions || []; } catch (e) { }

                                                for (const condition of conditions) {
                                                    if (condition.type === 'DEVICE_TYPE') {
                                                        const allowed = condition.devices || []; // Array or string
                                                        const allowedArr = Array.isArray(allowed) ? allowed : [allowed];
                                                        const normalizedAllowed = allowedArr.map((d: string) => d.toLowerCase());

                                                        // Preview Mode Check
                                                        const isMobile = previewMode === 'mobile';
                                                        const currentDevice = isMobile ? 'mobile' : 'desktop';

                                                        if (!normalizedAllowed.includes(currentDevice)) {
                                                            conditionsMet = false;
                                                            break;
                                                        }
                                                    }
                                                    // Time check could be added here if we had current time simulation
                                                }

                                                if (conditionsMet) {
                                                    let actions = [];
                                                    try { actions = typeof rule.actions === 'string' ? JSON.parse(rule.actions) : rule.actions || []; } catch (e) { }

                                                    actions.forEach((action: any) => {
                                                        if (action.type === 'SHOW_LINK' && action.linkId) visibleLinkIds.add(action.linkId);
                                                        if (action.type === 'HIDE_LINK' && action.linkId) visibleLinkIds.delete(action.linkId);
                                                    });
                                                }
                                            });

                                            const visibleLinks = links.filter(l => visibleLinkIds.has(l.id));



                                            // ... (rest of the file until preview loop)

                                            return visibleLinks.map(link => {
                                                let customStyle: LinkStyle = {};
                                                // Live Preview: If this link is being edited (Edit Form), use the watched form value
                                                const isEditingForm = editingLink?.id === link.id;
                                                // Live Preview: If this link is being styled (Appearance Tab), use the draft value
                                                const isStyling = draftLinkStyle.id === link.id;

                                                // Priority: Edit Form > Styling Draft > Saved Value
                                                const formStyle = isEditingForm ? watch('style') : null;
                                                const stylingStyle = isStyling ? draftLinkStyle.style : null;

                                                const linkStyleString = formStyle || stylingStyle || link.style;

                                                try {
                                                    if (linkStyleString) customStyle = JSON.parse(linkStyleString);
                                                } catch (e) { }

                                                const linkBg = customStyle.bgColor || currentTheme.buttonBgColor;
                                                const linkText = customStyle.textColor || currentTheme.buttonTextColor;
                                                const animationClass = customStyle.animation ? `animate-${customStyle.animation}` : '';
                                                const highlightClass = customStyle.highlight ? 'ring-2 ring-offset-2 ring-[#004d28] ring-offset-black/50 shadow-[0_0_10px_rgba(0,77,40,0.5)]' : 'border border-white/5';

                                                // Font Mapping
                                                const fontMap: Record<string, string> = {
                                                    inter: 'var(--font-inter)',
                                                    roboto: 'var(--font-roboto)',
                                                    playfair: 'var(--font-playfair)',
                                                    lato: 'var(--font-lato)',
                                                    oswald: 'var(--font-oswald)',
                                                    montserrat: 'var(--font-montserrat)',
                                                    lobster: 'var(--font-lobster)',
                                                    courier: 'var(--font-courier)',
                                                    bangers: 'var(--font-bangers)',
                                                };
                                                const linkFont = customStyle.fontFamily ? fontMap[customStyle.fontFamily] : undefined;

                                                return (
                                                    <div
                                                        key={link.id}
                                                        className={`glass-liquid w-full p-4 rounded-xl text-center text-sm font-medium hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center relative shadow-md ${animationClass} ${highlightClass}`}
                                                        style={{
                                                            backgroundColor: linkBg,
                                                            color: linkText,
                                                            fontFamily: linkFont
                                                        }}
                                                    >
                                                        {/* Icon */}
                                                        {getFaviconUrl(link.url) && (
                                                            <img
                                                                src={getFaviconUrl(link.url)!}
                                                                alt=""
                                                                className="absolute left-4 w-5 h-5 object-contain opacity-90"
                                                                onError={(e) => e.currentTarget.style.display = 'none'}
                                                            />
                                                        )}
                                                        <span className="truncate max-w-full px-4">{isEditingForm ? watch('title') : link.title}</span>
                                                    </div>
                                                )
                                            })
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-xs text-slate-500 mt-4">Live Preview ({previewMode === 'mobile' ? 'Mobile' : 'Desktop'})</p>
                    </div>
                </div>

            </main>
        </div>
    );
}
