'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { LinkHub } from '@/types';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { getFaviconUrl } from '@/lib/utils';
import { ThemeConfig } from '@/types';
import LinkCard from '@/app/components/LinkCard';

interface PublicHub extends LinkHub {
    user: {
        id: string;
        name: string | null;
        avatar: string | null;
    };
    links: any[];
}

export default function PublicHubPage() {
    const params = useParams();
    const [hub, setHub] = useState<PublicHub | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (params.slug) {
            const fetchHub = async () => {
                try {
                    // Call new endpoint structure
                    const { data } = await api.get(`/public/${params.username}/${params.slug}`);
                    setHub(data.hub);
                } catch (err) {
                    setError(true);
                } finally {
                    setLoading(false);
                }
            };
            fetchHub();
        }
    }, [params.slug]);

    const handleLinkClick = async (linkId: string, url: string) => {
        // Track click asynchronously
        try {
            await api.post(`/public/links/${linkId}/click`);
        } catch (e) {
            console.error('Failed to track click', e);
        }
        // Navigate
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !hub) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-slate-400 mb-8">This Link Vault does not exist or is inactive.</p>
                <a href="/" className="px-6 py-3 bg-green-600 rounded-full font-medium hover:bg-green-500 transition-colors">
                    Create your own Link Vault
                </a>
            </div>
        );
    }

    let theme: ThemeConfig = {
        bgColor: 'transparent',
        textColor: '#ffffff',
        buttonBgColor: '#0f172a',
        buttonTextColor: '#ffffff',
        fontFamily: 'inter',
    };
    try {
        const parsed = JSON.parse(hub.theme || '{}');
        theme = { ...theme, ...parsed };
    } catch (e) { }

    return (
        <div
            className="min-h-screen overflow-y-auto transition-colors duration-300 relative overflow-x-hidden"
            style={{ backgroundColor: theme.bgColor, color: theme.textColor, fontFamily: theme.fontFamily }}
        >
            {/* Premium Background Elements (Visible if theme bg is transparent/dark) */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none -z-10" />
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

            <div className="max-w-xl mx-auto px-4 py-16 flex flex-col items-center relative z-10">
                {/* Avatar with Premium Ring */}
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-tr from-green-400 to-emerald-600 mb-6 shadow-lg shadow-green-500/20">
                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-black/20 bg-black/20 backdrop-blur-sm">
                        {theme.avatar ? (
                            <img src={theme.avatar} alt={hub.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/10 backdrop-blur-md">
                                <span className="text-4xl font-bold opacity-50">{hub.title.charAt(0).toUpperCase()}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Header */}
                <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-center tracking-tight">{hub.title}</h1>
                <p className="text-center mb-10 max-w-md opacity-80 leading-relaxed font-light">{hub.description}</p>

                {/* Links */}
                <div className="w-full space-y-4">
                    {hub.links.map((link: any) => (
                        <LinkCard
                            key={link.id}
                            link={link}
                            theme={theme}
                            onClick={handleLinkClick}
                        />
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-16 text-sm opacity-60 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Powered by <a href="/" className="hover:underline font-bold hover:text-green-400 transition-colors">Link Vault</a>
                </div>
            </div>
        </div>
    );
}
