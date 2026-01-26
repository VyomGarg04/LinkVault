'use client';

import { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface HubSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    hub: any;
    onUpdate: (hub: any) => void;
}

export default function HubSettingsModal({ isOpen, onClose, hub, onUpdate }: HubSettingsModalProps) {
    const [title, setTitle] = useState(hub?.title || '');
    const [slug, setSlug] = useState(hub?.slug || '');
    const [description, setDescription] = useState(hub?.description || '');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (hub) {
            setTitle(hub.title);
            setSlug(hub.slug);
            setDescription(hub.description || '');
        }
    }, [hub]);

    if (!isOpen || !hub) return null;

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const { data } = await api.put(`/hubs/${hub.id}`, { title, slug, description });
            onUpdate(data.hub);
            toast.success("Hub updated");
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update hub");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this Hub?")) return;
        try {
            await api.delete(`/hubs/${hub.id}`);
            toast.success("Hub deleted");
            router.push('/dashboard');
        } catch (error) {
            toast.error("Failed to delete hub");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Hub Settings</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Hub Title</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">URL Slug</label>
                        <div className="flex items-center">
                            <span className="bg-slate-800 border border-r-0 border-slate-700 rounded-l-lg px-3 py-2 text-slate-400 text-sm">/</span>
                            <input
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-r-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Description</label>
                        <textarea
                            value={description || ''}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            placeholder="Tell visitors what this hub is about..."
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                    <button
                        onClick={handleDelete}
                        className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Hub
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
