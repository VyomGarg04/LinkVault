import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

const BASE_URL = 'http://localhost:3001/api';

async function testAuth() {
    console.log('--- Starting Auth Test ---');
    const email = `test_${Date.now()}@example.com`;
    const password = 'password123';

    try {
        // 1. Register
        console.log('1. Registering user...');
        const regRes = await client.post(`${BASE_URL}/auth/register`, {
            email,
            password,
            name: 'Test User'
        });
        console.log('✅ Register Success:', regRes.status, regRes.data.user.email);

        // 2. Get Me (Session should be active via cookie)
        console.log('2. Getting Current User...');
        const meRes = await client.get(`${BASE_URL}/auth/me`);
        console.log('✅ Get Me Success:', meRes.status, meRes.data.user.email);

        // 3. Logout
        console.log('3. Logging out...');
        const logoutRes = await client.post(`${BASE_URL}/auth/logout`);
        console.log('✅ Logout Success:', logoutRes.status);

        // 4. Get Me (Should fail)
        console.log('4. Verifying Logout (Getting Current User)...');
        try {
            await client.get(`${BASE_URL}/auth/me`);
            console.error('❌ Logout Failed: Still able to access protected route');
        } catch (error: any) {
            if (error.response?.status === 401) {
                console.log('✅ Verification Success: Access denied as expected (401)');
            } else {
                console.error('❌ Unexpected error:', error.message);
            }
        }

        // 5. Login
        console.log('5. Logging in again...');
        const loginRes = await client.post(`${BASE_URL}/auth/login`, {
            email,
            password
        });
        console.log('✅ Login Success:', loginRes.status);

    } catch (error: any) {
        console.error('❌ Test Failed:', error.response?.data || error.message);
    }
}

testAuth();
