import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';

// Helper to generate last 7 days array
const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]); // YYYY-MM-DD
    }
    return dates;
};

// GET /api/hubs/:id/analytics
export const getHubAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        const { id: hubId } = req.params;

        const hub = await prisma.linkHub.findUnique({
            where: { id: hubId }
        });

        if (!hub) return res.status(404).json({ message: 'Hub not found' });
        if (hub.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        // 1. Fetch Raw Data (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [visits, clicks, links] = await Promise.all([
            prisma.visit.findMany({
                where: {
                    hubId,
                    visitedAt: { gte: sevenDaysAgo }
                },
                select: { visitedAt: true, deviceType: true }
            }),
            prisma.click.findMany({
                where: {
                    link: { hubId },
                    clickedAt: { gte: sevenDaysAgo }
                },
                select: { clickedAt: true }
            }),
            prisma.link.findMany({
                where: { hubId },
                select: { id: true, title: true, url: true, clickCount: true, isActive: true },
                orderBy: { clickCount: 'desc' }
            })
        ]);

        // 2. Aggregate Time Series
        const dateMap = new Map<string, { visits: number; clicks: number }>();
        const last7Days = getLast7Days();

        // Initialize with 0
        last7Days.forEach(date => dateMap.set(date, { visits: 0, clicks: 0 }));

        // Fill Visits
        visits.forEach(v => {
            const date = v.visitedAt.toISOString().split('T')[0];
            if (dateMap.has(date)) {
                const entry = dateMap.get(date)!;
                entry.visits++;
            }
        });

        // Fill Clicks
        clicks.forEach(c => {
            const date = c.clickedAt.toISOString().split('T')[0];
            if (dateMap.has(date)) {
                const entry = dateMap.get(date)!;
                entry.clicks++;
            }
        });

        const timeSeries = last7Days.map(date => ({
            date,
            visits: dateMap.get(date)?.visits || 0,
            clicks: dateMap.get(date)?.clicks || 0
        }));

        // 3. Device Stats
        const deviceStats = {
            mobile: 0,
            desktop: 0
        };
        visits.forEach(v => {
            if (v.deviceType === 'mobile') deviceStats.mobile++;
            else deviceStats.desktop++;
        });

        // 4. Totals
        const totalVisits = await prisma.visit.count({ where: { hubId } });
        const totalClicks = await prisma.click.count({ where: { link: { hubId } } });

        let ctr = 0;
        if (totalVisits > 0) {
            ctr = (totalClicks / totalVisits) * 100;
        }

        res.json({
            timeSeries,
            deviceStats: [
                { name: 'Mobile', value: deviceStats.mobile, color: '#10b981' }, // green-500
                { name: 'Desktop', value: deviceStats.desktop, color: '#6366f1' } // indigo-500
            ],
            topLinks: links.slice(0, 5), // Top 5
            totalVisits,
            totalClicks,
            ctr: parseFloat(ctr.toFixed(1))
        });

    } catch (error: any) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: error.message });
    }
};
