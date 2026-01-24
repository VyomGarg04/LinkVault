'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Lock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function SecuritySettingsPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [isLoading, user, router]);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/users/password', { currentPassword, newPassword });
            toast.success("Password changed successfully");
            setCurrentPassword('');
            setNewPassword('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
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
                    <h1 className="text-xl font-bold">Security Settings</h1>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 py-8">
                <form onSubmit={handlePasswordChange} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Lock className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-200">Change Password</h2>
                            <p className="text-sm text-slate-400">Ensure your account is using a long, random password to stay secure.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 max-w-md">
                        <div className="space-y-2">
                            <label className="text-sm text-slate-400">Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-slate-400">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-800/50">
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all font-medium flex items-center space-x-2 disabled:opacity-50">
                            <Save className="w-4 h-4" />
                            <span>Update Password</span>
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
