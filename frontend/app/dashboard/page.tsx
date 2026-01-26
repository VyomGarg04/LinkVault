'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { LinkHub } from '@/types';
import Link from 'next/link';
import { Plus, ExternalLink, Edit2, BarChart2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import UserDropdown from '@/app/components/UserDropdown';
import HubSettingsModal from '@/app/components/HubSettingsModal';

export default function DashboardPage() {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const [hubs, setHubs] = useState<LinkHub[]>([]);
    const [fetching, setFetching] = useState(true);
    const [settingsHub, setSettingsHub] = useState<LinkHub | null>(null);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (user) {
            const fetchHubs = async () => {
                try {
                    const { data } = await api.get('/hubs');
                    setHubs(data.hubs);
                } catch (error) {
                    console.error('Failed to fetch hubs', error);
                } finally {
                    setFetching(false);
                }
            };
            fetchHubs();
        }
    }, [user]);

    const onDeleteHub = async (e: React.MouseEvent, id: string) => {
        e.preventDefault(); // Prevent navigation to editor if clicking the card
        e.stopPropagation();

        if (!window.confirm('Are you sure you want to delete this Hub? This action cannot be undone.')) {
            return;
        }

        try {
            await api.delete(`/hubs/${id}`);
            setHubs(hubs.filter(h => h.id !== id));
            toast.success('Hub deleted successfully');
        } catch (error) {
            toast.error('Failed to delete hub');
        }
    };

    if (isLoading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <div className="text-green-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white">
            <HubSettingsModal
                isOpen={!!settingsHub}
                onClose={() => setSettingsHub(null)}
                hub={settingsHub}
                onUpdate={(updatedHub) => {
                    setHubs(hubs.map(h => h.id === updatedHub.id ? updatedHub : h));
                }}
            />

            <nav className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="text-2xl font-bold tracking-tight">
                            <span className="text-white">Link</span>
                            <span className="text-green-500">Vault</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <UserDropdown user={user} logout={logout} />
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                        <p className="text-slate-400">Manage your links and view performance.</p>
                    </div>
                </div>

                {fetching ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div
                            onClick={() => router.push('/dashboard/new')}
                            className="group relative min-h-[14rem] h-full rounded-2xl border border-dashed border-white/20 hover:border-green-500/50 hover:bg-green-500/5 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden"
                        >
                            <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-green-500/20 flex items-center justify-center transition-colors mb-4 relative z-10">
                                <Plus className="w-8 h-8 text-slate-400 group-hover:text-green-400 transition-colors" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-400 group-hover:text-green-400 relative z-10">Create New Hub</h3>
                            <div className="absolute inset-0 bg-premium-gradient opacity-0 group-hover:opacity-20 transition-opacity" />
                        </div>

                        {hubs.map((hub) => (
                            <div key={hub.id} onClick={() => router.push(`/hubs/${hub.id}/edit`)} className="glass-card rounded-2xl p-6 min-h-[14rem] flex flex-col justify-between group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <h3 className="text-xl font-bold text-white truncate group-hover:text-green-400 transition-colors">{hub.title}</h3>
                                            <div className="text-sm text-slate-500 font-mono truncate mt-1">/{hub.slug}</div>
                                            {hub.description && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{hub.description}</p>}
                                        </div>
                                        {hub.isActive ? (
                                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" title="Active"></span>
                                        ) : (
                                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-slate-600" title="Inactive"></span>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-6 mt-6">
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-bold text-white">{hub._count?.links || 0}</span>
                                            <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Links</span>
                                        </div>
                                        <div className="w-px h-8 bg-white/10" />
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-bold text-white">{hub._count?.visits || 0}</span>
                                            <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Visits</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-white/5 opacity-60 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSettingsHub(hub);
                                            }}
                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-all hover:scale-110"
                                            title="Edit Hub Details"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <Link href={`/analytics/${hub.id}`} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-all hover:scale-110" title="Analytics">
                                            <BarChart2 className="w-4 h-4" />
                                        </Link>
                                    </div>
                                    <div className="flex space-x-1">
                                        {user?.username && (
                                            <a href={`/${user.username}/${hub.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-green-400 transition-all hover:scale-110" title="View Public">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                        <button
                                            onClick={(e) => onDeleteHub(e, hub.id)}
                                            className="p-2 bg-white/5 hover:bg-red-500/10 rounded-lg text-slate-300 hover:text-red-400 transition-all hover:scale-110"
                                            title="Delete Hub"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
