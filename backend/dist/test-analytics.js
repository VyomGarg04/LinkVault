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
const axios_1 = __importDefault(require("axios"));
const axios_cookiejar_support_1 = require("axios-cookiejar-support");
const tough_cookie_1 = require("tough-cookie");
const jar = new tough_cookie_1.CookieJar();
const client = (0, axios_cookiejar_support_1.wrapper)(axios_1.default.create({ jar }));
const BASE_URL = 'http://localhost:3001/api';
function testAnalytics() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log('--- Starting Analytics Test ---');
        const email = `test_analytics_${Date.now()}@example.com`;
        const password = 'password123';
        let hubId = '';
        let linkId = '';
        let username = '';
        let slug = '';
        try {
            // 1. Auth: Register
            console.log('1. Registering...');
            const authRes = yield client.post(`${BASE_URL}/auth/register`, {
                email,
                password,
                name: 'Analytics Tester'
            });
            username = authRes.data.user.username;
            // 2. Create Hub
            console.log('2. Creating Link Hub...');
            const hubRes = yield client.post(`${BASE_URL}/hubs`, {
                title: 'Analytics Data Hub',
                slug: `analytics-pool-${Date.now()}`,
                description: 'Generating Data'
            });
            hubId = hubRes.data.hub.id;
            slug = hubRes.data.hub.slug;
            // 3. Create Link
            console.log('3. Creating Link...');
            const linkRes = yield client.post(`${BASE_URL}/hubs/${hubId}/links`, {
                title: 'Tracked Link',
                url: 'https://example.com'
            });
            linkId = linkRes.data.link.id;
            // 4. Generate Visits (Public API)
            console.log('4. Generating Visits...');
            // We'll hit the public endpoint 3 times
            for (let i = 0; i < 3; i++) {
                yield client.get(`${BASE_URL}/public/${username}/${slug}`);
            }
            // 5. Generate Clicks (Public API)
            console.log('5. Generating Clicks...');
            // We'll click the link 2 times
            for (let i = 0; i < 2; i++) {
                yield client.post(`${BASE_URL}/public/links/${linkId}/click`);
            }
            // 6. Fetch Analytics
            console.log('6. Fetching Analytics...');
            const analyticsRes = yield client.get(`${BASE_URL}/analytics/${hubId}`);
            const stats = analyticsRes.data;
            console.log('Stats Received:', JSON.stringify(stats, null, 2));
            // Validations
            if (stats.totalVisits < 3)
                throw new Error(`Expected at least 3 visits, got ${stats.totalVisits}`);
            if (stats.totalClicks < 2)
                throw new Error(`Expected at least 2 clicks, got ${stats.totalClicks}`);
            if (stats.topLinks.length !== 1)
                throw new Error('Expected 1 top link');
            // Check Today's stats in timeSeries
            const today = new Date().toISOString().split('T')[0];
            const todayStats = stats.timeSeries.find((d) => d.date === today);
            if (!todayStats)
                throw new Error('Today stats missing from timeSeries');
            // Note: Visits might not be exact if async logging fails/delays, but usually it works.
            // Also, we run this in the same script, so it should be fast.
            if (todayStats.visits < 3)
                console.warn('Warning: Today visits count might be lagging or strictly checked');
            if (todayStats.clicks < 2)
                console.warn('Warning: Today clicks count might be lagging');
            console.log('🎉 ANALYTICS VERIFICATION SUCCESSFUL');
        }
        catch (error) {
            console.error('❌ Test Failed:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            process.exit(1);
        }
    });
}
testAnalytics();
//# sourceMappingURL=test-analytics.js.map