'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Instagram, Linkedin, Twitter, Youtube, Github, Mail, Globe } from 'lucide-react';

export default function DemoPage() {
    // Mock Data for Demo
    const mockHub = {
        title: "Demo Portfolio",
        description: "Welcome to my digital universe! Explore my work, socials, and latest projects below.",
        theme: {
            background: "bg-premium-gradient", // Using our new premium gradient
            cardStyle: "glass-card", // Using our new glass style
            textColor: "text-white"
        },
        user: {
            name: "Alex Creator",
            username: "alex_design",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", // Placeholder avatar
        },
        links: [
            { id: '1', title: "My Portfolio Website", url: "https://example.com", icon: "Globe", clicks: 1205 },
            { id: '2', title: "Latest Youtube Video", url: "https://youtube.com", icon: "Youtube", clicks: 850 },
            { id: '3', title: "Connect on LinkedIn", url: "https://linkedin.com", icon: "Linkedin", clicks: 500 },
            { id: '4', title: "Follow on Twitter", url: "https://twitter.com", icon: "Twitter", clicks: 320 },
            { id: '5', title: "GitHub Projects", url: "https://github.com", icon: "Github", clicks: 410 },
            { id: '6', title: "Newsletter Signup", url: "#", icon: "Mail", clicks: 150 },
        ]
    };

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'Instagram': return <Instagram className="w-5 h-5" />;
            case 'Linkedin': return <Linkedin className="w-5 h-5" />;
            case 'Twitter': return <Twitter className="w-5 h-5" />;
            case 'Youtube': return <Youtube className="w-5 h-5" />;
            case 'Github': return <Github className="w-5 h-5" />;
            case 'Mail': return <Mail className="w-5 h-5" />;
            case 'Globe': return <Globe className="w-5 h-5" />;
            default: return <ExternalLink className="w-5 h-5" />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background - Reusing the global premium styles */}
            <div className="absolute inset-0 bg-[#020617] -z-20" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none -z-10" />
            {/* Decorative Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />


            <div className="max-w-md w-full glass-card rounded-3xl p-8 transform transition-all hover:scale-[1.01] duration-500 border border-white/10 shadow-2xl relative z-10">
                {/* Profile Section */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-green-400 to-emerald-600 mb-4 shadow-lg shadow-green-500/20">
                        <img
                            src={mockHub.user.avatar}
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover border-4 border-[#020617]"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        {mockHub.title}
                        <span className="w-2 h-2 rounded-full bg-green-500 motion-safe:animate-pulse" title="Online" />
                    </h1>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                        {mockHub.description}
                    </p>
                </div>

                {/* Links Section */}
                <div className="space-y-4">
                    {mockHub.links.map((link) => (
                        <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-green-500/30 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

                            <div className="p-2 rounded-lg bg-green-500/10 text-green-400 mr-4 group-hover:scale-110 transition-transform duration-300">
                                {getIcon(link.icon)}
                            </div>
                            <span className="font-medium text-slate-200 group-hover:text-white transition-colors flex-1 text-center pr-10">
                                {link.title}
                            </span>
                            <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-green-400 absolute right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0" />
                        </a>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <a href="/" className="text-xs font-semibold text-slate-500 hover:text-green-400 transition-colors uppercase tracking-widest">
                        Powered by Link Vault
                    </a>
                </div>
            </div>

            <div className="fixed bottom-6 right-6">
                <a href="/register" className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-full shadow-lg shadow-green-900/30 hover:scale-105 transition-transform flex items-center gap-2">
                    Claim Your Hub <ExternalLink className="w-4 h-4" />
                </a>
            </div>
        </div>
    );
}
