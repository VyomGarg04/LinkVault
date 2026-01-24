"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHubAnalytics = void 0;
const db_1 = __importDefault(require("../config/db"));
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
const getHubAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id: hubId } = req.params;
        const hub = yield db_1.default.linkHub.findUnique({
            where: { id: hubId }
        });
        if (!hub)
            return res.status(404).json({ message: 'Hub not found' });
        if (hub.userId !== req.user.id)
            return res.status(403).json({ message: 'Not authorized' });
        const days = parseInt(req.query.days) || 7;
        // standardise strictly on UTC dates
        const now = new Date();
        const cutoffDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1)));
        cutoffDate.setUTCHours(0, 0, 0, 0);
        const includeDeleted = req.query.includeDeleted === 'true';
        const linkFilter = includeDeleted ? { hubId } : { hubId, deletedAt: null };
        const [visits, clicks, links, locationGroups] = yield Promise.all([
            db_1.default.visit.findMany({
                where: {
                    hubId,
                    visitedAt: { gte: cutoffDate }
                },
                select: { visitedAt: true, deviceType: true }
            }),
            db_1.default.click.findMany({
                where: {
                    link: linkFilter,
                    clickedAt: { gte: cutoffDate }
                },
                select: { clickedAt: true }
            }),
            db_1.default.link.findMany({
                where: linkFilter,
                select: { id: true, title: true, url: true, clickCount: true, isActive: true },
                orderBy: { clickCount: 'desc' }
            }),
            db_1.default.visit.groupBy({
                by: ['country'],
                where: {
                    hubId,
                    visitedAt: { gte: cutoffDate }
                },
                _count: { country: true },
                orderBy: { _count: { country: 'desc' } },
                take: 10
            })
        ]);
        // 2. Aggregate Time Series
        const dateMap = new Map();
        const dates = [];
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
                const entry = dateMap.get(date);
                entry.visits++;
                validVisitsCount++;
            }
        });
        // Fill Clicks
        let validClicksCount = 0;
        clicks.forEach(c => {
            const date = c.clickedAt.toISOString().split('T')[0];
            if (dateMap.has(date)) {
                const entry = dateMap.get(date);
                entry.clicks++;
                validClicksCount++;
            }
        });
        const timeSeries = dates.map(date => {
            var _a, _b;
            return ({
                date,
                visits: ((_a = dateMap.get(date)) === null || _a === void 0 ? void 0 : _a.visits) || 0,
                clicks: ((_b = dateMap.get(date)) === null || _b === void 0 ? void 0 : _b.clicks) || 0
            });
        });
        // 3. Device Stats
        const deviceStats = {
            mobile: 0,
            desktop: 0
        };
        visits.forEach(v => {
            // Only count visits that are within our valid date range (should be all, but safety check)
            const date = v.visitedAt.toISOString().split('T')[0];
            if (dateMap.has(date)) {
                if (v.deviceType === 'mobile')
                    deviceStats.mobile++;
                else
                    deviceStats.desktop++;
            }
        });
        // 4. Totals (Use the COUNT from the aggregated valid data, not the raw query length, to ensure 100% match)
        const totalVisits = validVisitsCount;
        const totalClicks = validClicksCount;
        let ctr = 0;
        if (totalVisits > 0) {
            ctr = (totalClicks / totalVisits) * 100;
        }
        res.json({
            range: days,
            timeSeries,
            deviceStats: [
                { name: 'Mobile', value: deviceStats.mobile, color: '#10b981' }, // green-500
                { name: 'Desktop', value: deviceStats.desktop, color: '#6366f1' } // indigo-500
            ],
            locationStats: locationGroups.map(g => ({ country: g.country || 'Unknown', count: g._count.country })),
            topLinks: links.slice(0, 5), // Top 5
            totalVisits,
            totalClicks,
            ctr: parseFloat(ctr.toFixed(1))
        });
    }
    catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: error.message });
    }
});
exports.getHubAnalytics = getHubAnalytics;
//# sourceMappingURL=analytics.controller.js.map