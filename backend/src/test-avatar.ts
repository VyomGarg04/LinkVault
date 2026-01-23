import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

const BASE_URL = 'http://localhost:3001/api';

async function testAvatar() {
    console.log('--- Testing Avatar Update ---');
    const email = `test_avatar_${Date.now()}@example.com`;
    const password = 'password123';
    let hubId = '';

    try {
        // 1. Register
        await client.post(`${BASE_URL}/auth/register`, {
            email,
            password,
            name: 'Avatar Tester'
        });

        // 2. Create Hub
        const hubRes = await client.post(`${BASE_URL}/hubs`, {
            title: 'Avatar Hub',
            slug: `avatar-hub-${Date.now()}`
        });
        hubId = hubRes.data.hub.id;
        console.log('✅ Hub Created:', hubId);

        // 3. Update Theme (Avatar)
        const avatarUrl = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';
        const themeString = JSON.stringify({ avatar: avatarUrl });

        await client.put(`${BASE_URL}/hubs/${hubId}`, {
            theme: themeString
        });
        console.log('✅ Avatar Updated');

        // 4. Verify Persistence
        const getRes = await client.get(`${BASE_URL}/hubs/${hubId}`);
        const fetchedTheme = JSON.parse(getRes.data.hub.theme);

        if (fetchedTheme.avatar === avatarUrl) {
            console.log('✅ Avatar Persistence Verified');
        } else {
            throw new Error('Avatar mismatch');
        }

    } catch (error: any) {
        console.error('❌ Test Failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

testAvatar();
