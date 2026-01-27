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

        const days = parseInt(req.query.days as string) || 7;

        // standardise strictly on UTC dates
        const now = new Date();
        const cutoffDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1)));
        cutoffDate.setUTCHours(0, 0, 0, 0);

        const includeDeleted = req.query.includeDeleted === 'true';

        const linkFilter = includeDeleted ? { hubId } : { hubId, deletedAt: null };

        // First get all links to get their IDs
        const links = await prisma.link.findMany({
            where: linkFilter,
            select: { id: true, title: true, url: true, isActive: true },
        });

        const linkIds = links.map(l => l.id);

        // Handle case where there are no links
        let clicks: { clickedAt: Date; linkId: string }[] = [];
        let clicksPerLink: { linkId: string; _count: { id: number } }[] = [];

        const [visits, locationGroups, ...clickResults] = await Promise.all([
            prisma.visit.findMany({
                where: {
                    hubId,
                    visitedAt: { gte: cutoffDate }
                },
                select: { visitedAt: true, deviceType: true }
            }),
            prisma.visit.groupBy({
                by: ['country'],
                where: {
                    hubId,
                    visitedAt: { gte: cutoffDate }
                },
                _count: { country: true },
                orderBy: { _count: { country: 'desc' } },
                take: 10
            }),
            // Only query clicks if there are links
            ...(linkIds.length > 0 ? [
                prisma.click.findMany({
                    where: {
                        linkId: { in: linkIds },
                        clickedAt: { gte: cutoffDate }
                    },
                    select: { clickedAt: true, linkId: true }
                }),
                prisma.click.groupBy({
                    by: ['linkId'],
                    where: {
                        linkId: { in: linkIds },
                        clickedAt: { gte: cutoffDate }
                    },
                    _count: { id: true }
                })
            ] : [])
        ]);

        // Assign click results if they exist
        if (linkIds.length > 0 && clickResults.length >= 2) {
            clicks = clickResults[0] as typeof clicks;
            clicksPerLink = clickResults[1] as typeof clicksPerLink;
        }

        // 2. Aggregate Time Series
        const dateMap = new Map<string, { visits: number; clicks: number }>();
        const dates: string[] = [];

        // Generate dates from cutoff to today (UTC)
        for (let i = 0; i < days; i++) {
            const d = new Date(cutoffDate);
            d.setUTCDate(cutoffDate.getUTCDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            dates.push(dateStr);
            dateMap.set(dateStr, { visits: 0, clicks: 0 });
        }

        // Fill Visits
        let validVisitsCount = 0;
        visits.forEach(v => {
            const date = v.visitedAt.toISOString().split('T')[0];
            if (dateMap.has(date)) {
                const entry = dateMap.get(date)!;
                entry.visits++;
                validVisitsCount++;
            }
        });

        // Fill Clicks
        let validClicksCount = 0;
        clicks.forEach(c => {
            const date = c.clickedAt.toISOString().split('T')[0];
            if (dateMap.has(date)) {
                const entry = dateMap.get(date)!;
                entry.clicks++;
                validClicksCount++;
            }
        });

        const timeSeries = dates.map(date => ({
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
            // Only count visits that are within our valid date range (should be all, but safety check)
            const date = v.visitedAt.toISOString().split('T')[0];
            if (dateMap.has(date)) {
                if (v.deviceType === 'mobile') deviceStats.mobile++;
                else deviceStats.desktop++;
            }
        });

        // 4. Totals (Use the COUNT from the aggregated valid data, not the raw query length, to ensure 100% match)
        const totalVisits = validVisitsCount;
        const totalClicks = validClicksCount;

        let ctr = 0;
        if (totalVisits > 0) {
            ctr = (totalClicks / totalVisits) * 100;
        }

        // 5. Map click counts to links for the selected date range
        const clickCountMap = new Map<string, number>();
        clicksPerLink.forEach(cp => {
            clickCountMap.set(cp.linkId, cp._count.id);
        });

        // Add clickCount to links and sort by it
        const linksWithClicks = links.map(link => ({
            ...link,
            clickCount: clickCountMap.get(link.id) || 0
        })).sort((a, b) => b.clickCount - a.clickCount);

        res.json({
            range: days,
            timeSeries,
            deviceStats: [
                { name: 'Mobile', value: deviceStats.mobile, color: '#10b981' }, // green-500
                { name: 'Desktop', value: deviceStats.desktop, color: '#6366f1' } // indigo-500
            ],
            locationStats: locationGroups.map(g => ({ country: g.country || 'Unknown', count: g._count.country })),
            topLinks: linksWithClicks.slice(0, 5), // Top 5
            totalVisits,
            totalClicks,
            ctr: parseFloat(ctr.toFixed(1))
        });

    } catch (error: any) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: error.message });
    }
};
