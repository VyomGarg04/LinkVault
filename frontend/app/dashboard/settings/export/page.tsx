'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Database, FileJson } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { LinkHub } from '@/types';

export default function ExportDataPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [hubs, setHubs] = useState<LinkHub[]>([]);
    const [exporting, setExporting] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
        if (user) {
            api.get('/hubs').then(({ data }) => setHubs(data.hubs)).catch(console.error);
        }
    }, [isLoading, user, router]);

    const convertToCSV = (data: any, type: 'all' | 'hub') => {
        const rows: any[] = [];

        if (type === 'all') {
            // Flatten all hubs and links
            if (data.linkHubs) {
                data.linkHubs.forEach((hub: any) => {
                    const hubIsActive = hub.isActive ? 'Yes' : 'No';
                    if (hub.links && hub.links.length > 0) {
                        hub.links.forEach((link: any) => {
                            rows.push({
                                HubTitle: hub.title,
                                HubSlug: hub.slug,
                                HubActive: hubIsActive,
                                LinkTitle: link.title,
                                LinkURL: link.url,
                                Clicks: link.clickCount,
                                LinkActive: link.isActive ? 'Yes' : 'No'
                            });
                        });
                    } else {
                        // Hub with no links
                        rows.push({
                            HubTitle: hub.title,
                            HubSlug: hub.slug,
                            HubActive: hubIsActive,
                            LinkTitle: '-',
                            LinkURL: '-',
                            Clicks: 0,
                            LinkActive: '-'
                        });
                    }
                });
            }
        } else {
            // Single Hub
            const hubIsActive = data.isActive ? 'Yes' : 'No';
            if (data.links && data.links.length > 0) {
                data.links.forEach((link: any) => {
                    rows.push({
                        HubTitle: data.title,
                        HubSlug: data.slug,
                        HubActive: hubIsActive,
                        LinkTitle: link.title,
                        LinkURL: link.url,
                        Clicks: link.clickCount,
                        LinkActive: link.isActive ? 'Yes' : 'No'
                    });
                });
            } else {
                rows.push({
                    HubTitle: data.title,
                    HubSlug: data.slug,
                    HubActive: hubIsActive,
                    LinkTitle: '-',
                    LinkURL: '-',
                    Clicks: 0,
                    LinkActive: '-'
                });
            }
        }

        if (rows.length === 0) return '';

        const headers = Object.keys(rows[0]);
        const csvContent = [
            headers.join(','),
            ...rows.map(row => headers.map(header => {
                const val = row[header];
                // Escape quotes and wrap in quotes if necessary
                const stringVal = String(val).replace(/"/g, '""');
                return `"${stringVal}"`;
            }).join(','))
        ].join('\n');

        return csvContent;
    };

    const downloadFile = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const handleExportAll = async () => {
        setExporting('all');
        try {
            const { data } = await api.get('/users/export');
            const csv = convertToCSV(data, 'all');
            if (!csv) {
                toast.error("No data to export");
            } else {
                downloadFile(csv, `linkvault-full-export-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
                toast.success("Full export downloaded (CSV)");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to export all data");
        } finally {
            setExporting(null);
        }
    };

    const handleExportHub = async (hubId: string, hubTitle: string) => {
        setExporting(hubId);
        try {
            const { data } = await api.get(`/hubs/${hubId}/export`);
            const csv = convertToCSV(data, 'hub');
            if (!csv) {
                toast.error("No data to export");
            } else {
                downloadFile(csv, `linkvault-hub-${hubTitle.toLowerCase().replace(/\s+/g, '-')}.csv`, 'text/csv');
                toast.success(`Exported ${hubTitle} (CSV)`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to export hub");
        } finally {
            setExporting(null);
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
                    <h1 className="text-xl font-bold">Export Data (CSV)</h1>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">

                {/* Export All */}
                <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Database className="w-5 h-5 text-indigo-500" />
                                Full Account Export
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">Download a readable CSV spreadsheet of all your hubs and links.</p>
                        </div>
                        <button
                            onClick={handleExportAll}
                            disabled={!!exporting}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all font-medium flex items-center space-x-2 disabled:opacity-50"
                        >
                            {exporting === 'all' ? (
                                <span className="animate-pulse">Exporting...</span>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    <span>Download CSV</span>
                                </>
                            )}
                        </button>
                    </div>
                </section>

                {/* Individual Hubs */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                        <FileJson className="w-5 h-5 text-green-500" />
                        Individual Hub Exports
                    </h2>
                    <div className="grid gap-3">
                        {hubs.map((hub) => (
                            <div key={hub.id} className="bg-slate-900/30 border border-slate-800 rounded-lg p-4 flex items-center justify-between hover:border-slate-700 transition-all">
                                <div>
                                    <h3 className="font-medium text-white">{hub.title}</h3>
                                    <p className="text-xs text-slate-500">/{hub.slug}</p>
                                </div>
                                <button
                                    onClick={() => handleExportHub(hub.id, hub.title)}
                                    disabled={!!exporting}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                                    title="Export as CSV"
                                >
                                    {exporting === hub.id ? (
                                        <span className="animate-spin w-4 h-4 block rounded-full border-2 border-slate-500 border-t-white" />
                                    ) : (
                                        <Download className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
