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
        // 1. Fetch Raw Data (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const [visits, clicks, links] = yield Promise.all([
            db_1.default.visit.findMany({
                where: {
                    hubId,
                    visitedAt: { gte: sevenDaysAgo }
                },
                select: { visitedAt: true, deviceType: true }
            }),
            db_1.default.click.findMany({
                where: {
                    link: { hubId },
                    clickedAt: { gte: sevenDaysAgo }
                },
                select: { clickedAt: true }
            }),
            db_1.default.link.findMany({
                where: { hubId },
                select: { id: true, title: true, url: true, clickCount: true, isActive: true },
                orderBy: { clickCount: 'desc' }
            })
        ]);
        // 2. Aggregate Time Series
        const dateMap = new Map();
        const last7Days = getLast7Days();
        // Initialize with 0
        last7Days.forEach(date => dateMap.set(date, { visits: 0, clicks: 0 }));
        // Fill Visits
        visits.forEach(v => {
            const date = v.visitedAt.toISOString().split('T')[0];
            if (dateMap.has(date)) {
                const entry = dateMap.get(date);
                entry.visits++;
            }
        });
        // Fill Clicks
        clicks.forEach(c => {
            const date = c.clickedAt.toISOString().split('T')[0];
            if (dateMap.has(date)) {
                const entry = dateMap.get(date);
                entry.clicks++;
            }
        });
        const timeSeries = last7Days.map(date => {
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
            if (v.deviceType === 'mobile')
                deviceStats.mobile++;
            else
                deviceStats.desktop++;
        });
        // 4. Totals
        const totalVisits = yield db_1.default.visit.count({ where: { hubId } });
        const totalClicks = yield db_1.default.click.count({ where: { link: { hubId } } });
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
    }
    catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: error.message });
    }
});
exports.getHubAnalytics = getHubAnalytics;
//# sourceMappingURL=analytics.controller.js.map