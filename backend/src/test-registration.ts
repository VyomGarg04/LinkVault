import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

const BASE_URL = 'http://localhost:3001/api';

async function testRegistration() {
    console.log('--- Testing Registration ---');
    const email = `test_reg_${Date.now()}@example.com`;
    const password = 'password123';

    try {
        console.log('1. Attempting Registration...');
        const res = await client.post(`${BASE_URL}/auth/register`, {
            email,
            password,
            name: 'Test User'
        });

        if (res.status === 201 && res.data.user.email === email) {
            console.log('✅ Registration Successful');
            console.log(`User ID: ${res.data.user.id}`);
            console.log(`Username: ${res.data.user.username}`);
        } else {
            throw new Error('Registration response invalid');
        }

        console.log('2. Attempting Login with same credentials...');
        const loginRes = await client.post(`${BASE_URL}/auth/login`, { email, password });
        if (loginRes.status === 200) {
            console.log('✅ Login Successful');
        } else {
            throw new Error('Login failed');
        }

    } catch (error: any) {
        console.error('❌ Test Failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

testRegistration();
