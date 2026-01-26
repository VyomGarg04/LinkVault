'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, MousePointer2, Users, Smartphone, Monitor } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import Link from 'next/link';

export default function AnalyticsPage() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState(7); // Default 7 days
    const [includeDeleted, setIncludeDeleted] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!params.id) return;
            setLoading(true);
            try {
                const res = await api.get(`/analytics/${params.id}?days=${range}&includeDeleted=${includeDeleted}`);
                setData(res.data);
            } catch (error) {
                console.error("Failed to load analytics", error);
                router.push('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [params.id, range, includeDeleted, router]);

    if (loading) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-green-500">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium uppercase tracking-widest text-slate-500">Analyzing Data...</span>
            </div>
        </div>;
    }

    if (!data) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold">Analytics Dashboard</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Include Deleted Toggle */}
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">History</span>
                            <button
                                onClick={() => setIncludeDeleted(!includeDeleted)}
                                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${includeDeleted ? 'bg-indigo-600' : 'bg-slate-700'}`}
                            >
                                <span className="sr-only">Show Deleted</span>
                                <span
                                    aria-hidden="true"
                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${includeDeleted ? 'translate-x-4' : 'translate-x-0'}`}
                                />
                            </button>
                        </div>
                        <div className="w-px h-6 bg-slate-800" />
                        {/* Range Selector */}
                        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
                            {[7, 30, 90].map(days => (
                                <button
                                    key={days}
                                    onClick={() => setRange(days)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${range === days
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                >
                                    {days} Days
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users className="w-16 h-16 text-indigo-500" />
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Visits</h3>
                        <p className="text-4xl font-bold text-white mt-2">{data.totalVisits}</p>
                        <p className="text-xs text-slate-500 mt-1">Last {range} Days</p>
                    </div>

                    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl relative overflow-hidden group hover:border-green-500/30 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <MousePointer2 className="w-16 h-16 text-green-500" />
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Clicks</h3>
                        <p className="text-4xl font-bold text-white mt-2">{data.totalClicks}</p>
                        <p className="text-xs text-slate-500 mt-1">Last {range} Days</p>
                    </div>

                    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl relative overflow-hidden group hover:border-rose-500/30 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <div className="text-6xl font-black text-rose-500">%</div>
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Click Through Rate</h3>
                        <p className="text-4xl font-bold text-white mt-2">{data.ctr}%</p>
                        <p className="text-xs text-slate-500 mt-1">Performance Score</p>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Area Chart */}
                    <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex flex-col h-[584px]">
                        <h3 className="text-lg font-semibold mb-6 flex items-center justify-between">
                            <span>Traffic Overview</span>
                            <span className="text-xs text-slate-500 font-normal">Visits vs Clicks</span>
                        </h3>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.timeSeries}>
                                    <defs>
                                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#475569"
                                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(str) => {
                                            const date = new Date(str);
                                            return `${date.getMonth() + 1}/${date.getDate()}`;
                                        }}
                                        interval="preserveStartEnd"
                                        minTickGap={30}
                                    />
                                    <YAxis
                                        stroke="#475569"
                                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                        itemStyle={{ color: '#e2e8f0' }}
                                    />
                                    <Area type="monotone" dataKey="visits" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" name="Visits" />
                                    <Area type="monotone" dataKey="clicks" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" name="Clicks" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Right Column: Device + Location */}
                    <div className="space-y-6">
                        {/* Device Pie Chart */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex flex-col h-[280px]">
                            <h3 className="text-lg font-semibold mb-4 text-slate-200">Device Types</h3>
                            <div className="flex-1 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.deviceStats}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {data.deviceStats.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '0.5rem' }}
                                            itemStyle={{ color: '#e2e8f0' }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            iconType="circle"
                                            formatter={(value) => <span className="text-slate-400 text-xs font-bold ml-1">{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                                    <Smartphone className="w-5 h-5 text-slate-700" />
                                </div>
                            </div>
                        </div>

                        {/* Location Stats */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-[280px] overflow-auto">
                            <h3 className="text-lg font-semibold mb-4 text-slate-200 sticky top-0 bg-slate-900/50 backdrop-blur-md pb-2">Top Locations</h3>
                            <div className="space-y-3">
                                {data.locationStats?.length > 0 ? (
                                    data.locationStats.map((loc: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                                                    {i + 1}
                                                </div>
                                                <span className="text-sm text-slate-300 font-medium">{loc.country === 'null' ? 'Unknown' : loc.country}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 rounded-full"
                                                        style={{ width: `${(loc.count / data.totalVisits) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-mono text-slate-400 w-8 text-right">{loc.count}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-slate-500 text-sm py-8">
                                        No location data yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Links Table */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Top Performing Links</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 border-b border-slate-800">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Link Title</th>
                                    <th className="px-4 py-3">URL</th>
                                    <th className="px-4 py-3 text-right">Clicks</th>
                                    <th className="px-4 py-3 rounded-tr-lg text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {data.topLinks.map((link: any) => (
                                    <tr key={link.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{link.title}</td>
                                        <td className="px-4 py-3 text-slate-400 text-sm truncate max-w-[200px]">{link.url}</td>
                                        <td className="px-4 py-3 text-right font-mono text-green-400">{link.clickCount}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${link.isActive ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'
                                                }`}>
                                                {link.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {data.topLinks.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-slate-500">No link activity yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
}
