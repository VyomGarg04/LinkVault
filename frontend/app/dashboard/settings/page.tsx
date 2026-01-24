'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Lock, Trash2, ChevronRight, Shield, Download } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function SettingsHubPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [isLoading, user, router]);

    if (isLoading || !user) return null;

    const menuItems = [
        {
            title: 'Profile Settings',
            description: 'Update your name, username, and profile picture.',
            icon: User,
            href: '/dashboard/settings/profile',
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10'
        },
        {
            title: 'Security',
            description: 'Change your password and secure your account.',
            icon: Lock,
            href: '/dashboard/settings/security',
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10'
        },
        {
            title: 'Account Control',
            description: 'Manage account deletion and data.',
            icon: Trash2,
            href: '/dashboard/settings/account',
            color: 'text-red-400',
            bg: 'bg-red-500/10'
        },
        {
            title: 'Export Data',
            description: 'Download your hubs and account data.',
            icon: Download,
            href: '/dashboard/settings/export',
            color: 'text-blue-400',
            bg: 'bg-blue-500/10'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">
            <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center space-x-4">
                    <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl font-bold">Settings</h1>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-slate-800 overflow-hidden border-2 border-slate-700">
                        {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-500">
                                {user.name?.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">{user.name}</h2>
                        <p className="text-slate-400">{user.email}</p>
                    </div>
                </div>

                <div className="grid gap-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:bg-slate-800/80 hover:border-slate-700 transition-all group"
                        >
                            <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-lg ${item.bg}`}>
                                    <item.icon className={`w-6 h-6 ${item.color}`} />
                                </div>
                                <div>
                                    <h3 className="font-medium text-slate-200 group-hover:text-white transition-colors">{item.title}</h3>
                                    <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors">{item.description}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-300 transition-colors" />
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
