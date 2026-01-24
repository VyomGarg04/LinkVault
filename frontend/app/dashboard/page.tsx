'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { LinkHub } from '@/types';
import Link from 'next/link';
import { Plus, ExternalLink, Edit2, BarChart2, Trash2, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DashboardPage() {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const [hubs, setHubs] = useState<LinkHub[]>([]);
    const [fetching, setFetching] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
            <nav className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="text-2xl font-bold tracking-tight">
                            <span className="text-white">Link</span>
                            <span className="text-green-500">Vault</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm overflow-hidden ring-2 ring-black">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsDropdownOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
                                            <div className="p-4 border-b border-white/5 bg-white/5">
                                                <p className="text-sm font-bold text-white truncate">{user.name || 'User'}</p>
                                                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                            </div>
                                            <div className="p-1.5 space-y-0.5">
                                                <button
                                                    onClick={() => router.push('/dashboard/profile')}
                                                    className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                                                >
                                                    <User className="w-4 h-4" />
                                                    <span>Profile</span>
                                                </button>
                                                <button
                                                    onClick={() => router.push('/dashboard/settings')}
                                                    className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    <span>Settings</span>
                                                </button>
                                                <div className="h-px bg-white/5 my-1 mx-2" />
                                                <button
                                                    onClick={() => logout()}
                                                    className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    <span>Sign Out</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
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
                            className="group relative h-56 rounded-2xl border border-dashed border-white/20 hover:border-green-500/50 hover:bg-green-500/5 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden"
                        >
                            <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-green-500/20 flex items-center justify-center transition-colors mb-4 relative z-10">
                                <Plus className="w-8 h-8 text-slate-400 group-hover:text-green-400 transition-colors" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-400 group-hover:text-green-400 relative z-10">Create New Hub</h3>
                            <div className="absolute inset-0 bg-premium-gradient opacity-0 group-hover:opacity-20 transition-opacity" />
                        </div>

                        {hubs.map((hub) => (
                            <div key={hub.id} onClick={() => router.push(`/hubs/${hub.id}/edit`)} className="glass-card rounded-2xl p-6 h-56 flex flex-col justify-between group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <h3 className="text-xl font-bold text-white truncate group-hover:text-green-400 transition-colors">{hub.title}</h3>
                                            <div className="text-sm text-slate-500 font-mono truncate mt-1">/{hub.slug}</div>
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
                                        <Link href={`/hubs/${hub.id}/edit`} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" title="Edit">
                                            <Edit2 className="w-4 h-4" />
                                        </Link>
                                        <Link href={`/analytics/${hub.id}`} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" title="Analytics">
                                            <BarChart2 className="w-4 h-4" />
                                        </Link>
                                    </div>
                                    <div className="flex space-x-1">
                                        {user?.username && (
                                            <a href={`/${user.username}/${hub.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-green-400 transition-colors" title="View Public">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                        <button
                                            onClick={(e) => onDeleteHub(e, hub.id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
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
