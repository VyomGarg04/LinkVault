'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Box, Link as LinkIcon, Activity, Edit3 } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [isLoading, user, router]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/users/stats');
                setStats(data.stats);
            } catch (error) {
                console.error("Failed to load stats");
            } finally {
                setLoadingStats(false);
            }
        };
        fetchStats();
    }, []);

    if (isLoading || !user) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center space-x-4">
                    <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl font-bold">My Profile</h1>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                {/* Profile Header */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 flex flex-col items-center sm:flex-row sm:items-start sm:space-x-8">
                    <div className="w-32 h-32 rounded-full ring-4 ring-slate-800 overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-2xl">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name!} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-5xl font-bold text-white">{user.name?.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="mt-6 sm:mt-2 text-center sm:text-left flex-1">
                        <h2 className="text-3xl font-bold text-white">{user.name}</h2>
                        <p className="text-slate-400 font-mono mt-1">@{user.username}</p>
                        <p className="text-slate-500 text-sm mt-4">{user.email}</p>

                        <div className="mt-6">
                            <Link href="/dashboard/settings" className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-sm font-medium">
                                <Edit3 className="w-4 h-4" />
                                <span>Edit Profile</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Cumulative Stats */}
                <h3 className="text-xl font-semibold px-1">Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl relative group">
                        <div className="absolute top-6 right-6 p-3 bg-indigo-500/10 rounded-lg text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            <Box className="w-6 h-6" />
                        </div>
                        <p className="text-slate-500 text-sm uppercase font-medium tracking-wider">Total Hubs</p>
                        <p className="text-3xl font-bold text-white mt-2">{loadingStats ? '-' : stats?.hubs}</p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl relative group">
                        <div className="absolute top-6 right-6 p-3 bg-green-500/10 rounded-lg text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all">
                            <LinkIcon className="w-6 h-6" />
                        </div>
                        <p className="text-slate-500 text-sm uppercase font-medium tracking-wider">Active Links</p>
                        <p className="text-3xl font-bold text-white mt-2">{loadingStats ? '-' : stats?.links}</p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl relative group">
                        <div className="absolute top-6 right-6 p-3 bg-rose-500/10 rounded-lg text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all">
                            <Activity className="w-6 h-6" />
                        </div>
                        <p className="text-slate-500 text-sm uppercase font-medium tracking-wider">Total Clicks</p>
                        <p className="text-3xl font-bold text-white mt-2">{loadingStats ? '-' : stats?.clicks}</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
