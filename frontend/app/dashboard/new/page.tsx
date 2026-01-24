'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const createHubSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric and hyphens only'),
    description: z.string().optional(),
});

type CreateHubFormData = z.infer<typeof createHubSchema>;

export default function CreateHubPage() {
    const router = useRouter();
    const { user } = useAuth();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateHubFormData>({
        resolver: zodResolver(createHubSchema),
    });

    const onSubmit = async (data: CreateHubFormData) => {
        try {
            await api.post('/hubs', data);
            toast.success('Hub created successfully!');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create hub');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 flex items-center justify-center">
            <div className="w-full max-w-lg space-y-6">
                <Link href="/dashboard" className="inline-flex items-center text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                        Create New Hub
                    </h1>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Hub Application Title</label>
                            <input
                                {...register('title')}
                                type="text"
                                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-white placeholder-slate-500"
                                placeholder="My Awesome Links"
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">URL Slug</label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-700 bg-slate-800 text-slate-400 text-sm">
                                    linkvault.app/
                                </span>
                                <input
                                    {...register('slug')}
                                    type="text"
                                    className="flex-1 w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-r-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-white placeholder-slate-500"
                                    placeholder="my-links"
                                />
                            </div>
                            {errors.slug && (
                                <p className="mt-1 text-sm text-red-400">{errors.slug.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Description (Optional)</label>
                            <textarea
                                {...register('description')}
                                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-white placeholder-slate-500"
                                placeholder="A collection of my social links..."
                                rows={3}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-lg shadow-lg shadow-green-900/20 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Hub'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
