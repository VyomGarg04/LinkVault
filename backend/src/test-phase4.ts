import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

const BASE_URL = 'http://localhost:3001/api';

async function testPhase4() {
    console.log('--- Testing Phase 4: Username & Settings ---');
    const timestamp = Date.now();
    const email = `phase4_${timestamp}@example.com`; // expected username: phase4_TIMESTAMP
    const password = 'password123';

    try {
        // 1. Register & Verify Generated Username
        console.log('1. Registering...');
        await client.post(`${BASE_URL}/auth/register`, { email, password, name: 'Phase 4 User' });

        // Explicit login to ensure cookie
        await client.post(`${BASE_URL}/auth/login`, { email, password });

        const meRes = await client.get(`${BASE_URL}/auth/me`);
        const generatedUsername = meRes.data.user.username;
        console.log(`✅ Generated Username: ${generatedUsername}`);

        if (!generatedUsername) {
            throw new Error('Username generation failed');
        }

        // 2. Create Hub
        await client.post(`${BASE_URL}/hubs`, { title: 'User Hub', slug: `hub-${timestamp}` });

        // 3. Test Public Access (Correct Username)
        console.log('3. Testing Public Access (Valid)...');
        const publicClient = axios.create();
        await publicClient.get(`${BASE_URL}/public/${generatedUsername}/hub-${timestamp}`);
        console.log('✅ Access allowed');

        // 4. Test Public Access (Wrong Username)
        console.log('4. Testing Public Access (Invalid Username)...');
        try {
            await publicClient.get(`${BASE_URL}/public/wronguser/hub-${timestamp}`);
            throw new Error('Should have failed access');
        } catch (e: any) {
            if (e.response?.status === 404) console.log('✅ Access denied correctly');
            else throw e;
        }

        // 5. Update Profile (Change Username)
        console.log('5. Updating Username...');
        const newUsername = `newuser${timestamp}`;
        const updateRes = await client.put(`${BASE_URL}/auth/profile`, { username: newUsername });
        const updatedUsername = updateRes.data.user.username;

        if (updatedUsername !== newUsername) throw new Error('Update failed');
        console.log('✅ Username updated');

        // 6. Verify New URL works
        console.log('6. Verifying New URL...');
        await publicClient.get(`${BASE_URL}/public/${newUsername}/hub-${timestamp}`);
        console.log('✅ New URL working');

        console.log('🎉 PHASE 4 VERIFICATION SUCCESSFUL');

    } catch (error: any) {
        console.error('❌ Test Failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

testPhase4();
