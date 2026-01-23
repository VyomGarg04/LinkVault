import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

const BASE_URL = 'http://localhost:3001/api';

async function testPublic() {
    console.log('--- Testing Public View & Unique Slugs ---');
    const email = `test_public_${Date.now()}@example.com`;
    const password = 'password123';
    const slug = `public-hub-${Date.now()}`;
    let hubId = '';
    let linkId = '';

    try {
        // 1. Setup Data
        console.log('1. Setting up Hub with Links...');
        await client.post(`${BASE_URL}/auth/register`, { email, password, name: 'Public Tester' });

        // Explicit login to ensure cookie
        await client.post(`${BASE_URL}/auth/login`, { email, password });

        const hubRes = await client.post(`${BASE_URL}/hubs`, { title: 'My Public Hub', slug });
        hubId = hubRes.data.hub.id;

        const linkRes = await client.post(`${BASE_URL}/hubs/${hubId}/links`, { title: 'Public Link', url: 'https://example.com' });
        linkId = linkRes.data.link.id;

        // 2. Fetch Public Hub (Unauthenticated)
        console.log('2. Fetching Public Hub anonymously...');
        const publicClient = axios.create();
        const publicRes = await publicClient.get(`${BASE_URL}/public/hubs/${slug}`);

        if (publicRes.data.hub.title === 'My Public Hub') {
            console.log('✅ Public Hub fetched successfully');
        } else {
            throw new Error('Public Hub data mismatch');
        }

        // 3. Track Click
        console.log('3. Tracking Click...');
        await publicClient.post(`${BASE_URL}/public/links/${linkId}/click`);
        console.log('✅ Click tracked');

        // 4. Verify Unique Slug Enforcement
        console.log('4. Verifying Slug Uniqueness...');
        try {
            await client.post(`${BASE_URL}/hubs`, { title: 'Duplicate Hub', slug });
            throw new Error('Duplicate slug was allowed!');
        } catch (e: any) {
            if (e.response && e.response.status === 400) {
                console.log('✅ Duplicate slug rejected properly');
            } else {
                throw e;
            }
        }

        console.log('🎉 PHASE 3 VERIFICATION SUCCESSFUL');

    } catch (error: any) {
        console.error('❌ Test Failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

testPublic();
