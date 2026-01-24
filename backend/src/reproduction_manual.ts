
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function testAuth() {
    console.log('Testing Authentication...');
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'password123';

    try {
        // 1. Register
        console.log(`\nAttempting to register user: ${email}`);
        const regRes = await axios.post(`${API_URL}/auth/register`, {
            email,
            password,
            name: 'Test User'
        });
        console.log('✅ Registration Successful:', regRes.status, regRes.data.user.email);

        // 2. Login
        console.log('\nAttempting to login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });
        console.log('✅ Login Successful:', loginRes.status, loginRes.data.user.email);

    } catch (error: any) {
        console.error('❌ Auth Failed:');
        if (error.code) console.error('Code:', error.code);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Message:', error.message);
            console.error('Full Error:', error);
        }
    }
}

testAuth();
