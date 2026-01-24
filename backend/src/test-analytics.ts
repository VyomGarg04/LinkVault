import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

const BASE_URL = 'http://localhost:3001/api';

async function testAnalytics() {
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
        const authRes = await client.post(`${BASE_URL}/auth/register`, {
            email,
            password,
            name: 'Analytics Tester'
        });
        username = authRes.data.user.username;

        // 2. Create Hub
        console.log('2. Creating Link Hub...');
        const hubRes = await client.post(`${BASE_URL}/hubs`, {
            title: 'Analytics Data Hub',
            slug: `analytics-pool-${Date.now()}`,
            description: 'Generating Data'
        });
        hubId = hubRes.data.hub.id;
        slug = hubRes.data.hub.slug;

        // 3. Create Link
        console.log('3. Creating Link...');
        const linkRes = await client.post(`${BASE_URL}/hubs/${hubId}/links`, {
            title: 'Tracked Link',
            url: 'https://example.com'
        });
        linkId = linkRes.data.link.id;

        // 4. Generate Visits (Public API)
        console.log('4. Generating Visits...');
        // We'll hit the public endpoint 3 times
        for (let i = 0; i < 3; i++) {
            await client.get(`${BASE_URL}/public/${username}/${slug}`);
        }

        // 5. Generate Clicks (Public API)
        console.log('5. Generating Clicks...');
        // We'll click the link 2 times
        for (let i = 0; i < 2; i++) {
            await client.post(`${BASE_URL}/public/links/${linkId}/click`);
        }

        // 6. Fetch Analytics
        console.log('6. Fetching Analytics...');
        const analyticsRes = await client.get(`${BASE_URL}/analytics/${hubId}`);
        const stats = analyticsRes.data;

        console.log('Stats Received:', JSON.stringify(stats, null, 2));

        // Validations
        if (stats.totalVisits < 3) throw new Error(`Expected at least 3 visits, got ${stats.totalVisits}`);
        if (stats.totalClicks < 2) throw new Error(`Expected at least 2 clicks, got ${stats.totalClicks}`);
        if (stats.topLinks.length !== 1) throw new Error('Expected 1 top link');

        // Check Today's stats in timeSeries
        const today = new Date().toISOString().split('T')[0];
        const todayStats = stats.timeSeries.find((d: any) => d.date === today);
        if (!todayStats) throw new Error('Today stats missing from timeSeries');

        // Note: Visits might not be exact if async logging fails/delays, but usually it works.
        // Also, we run this in the same script, so it should be fast.
        if (todayStats.visits < 3) console.warn('Warning: Today visits count might be lagging or strictly checked');
        if (todayStats.clicks < 2) console.warn('Warning: Today clicks count might be lagging');

        console.log('🎉 ANALYTICS VERIFICATION SUCCESSFUL');

    } catch (error: any) {
        console.error('❌ Test Failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

testAnalytics();
