'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function AccountSettingsPage() {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [isLoading, user, router]);

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you ABSOLUTELY sure? This will delete your user account, profile, and ALL your Hubs permanently. This action cannot be undone.")) return;

        const confirmText = prompt("Type 'DELETE' to confirm:");
        if (confirmText !== 'DELETE') return;

        try {
            await api.delete('/users/me');
            logout();
            toast.success("Account deleted");
            router.push('/');
        } catch (error: any) {
            toast.error("Failed to delete account");
        }
    };

    if (isLoading || !user) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">
            <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center space-x-4">
                    <Link href="/dashboard/settings" className="text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl font-bold">Account Settings</h1>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 space-y-6">
                    <div className="flex items-center space-x-3 text-red-500">
                        <AlertTriangle className="w-8 h-8" />
                        <h2 className="text-xl font-bold">Danger Zone</h2>
                    </div>

                    <p className="text-slate-400">
                        Once you delete your account, there is no going back. Please be certain.
                    </p>

                    <div className="bg-red-950/30 p-4 rounded-lg border border-red-900/50">
                        <h3 className="font-semibold text-red-400 mb-2">Delete Account</h3>
                        <p className="text-sm text-red-300/70 mb-4">Permanently remove your account and all associated Hubs.</p>
                        <button
                            onClick={handleDeleteAccount}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete My Account</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
