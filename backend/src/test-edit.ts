import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

const BASE_URL = 'http://localhost:3001/api';

async function testEditFunctionality() {
    console.log('--- Starting Edit Functionality Test (Links & Rules) ---');
    const email = `test_edit_${Date.now()}@example.com`;
    const password = 'password123';
    let hubId = '';
    let linkId = '';
    let ruleId = '';

    try {
        // 1. Auth
        console.log('1. Registering/Login...');
        await client.post(`${BASE_URL}/auth/register`, {
            email,
            password,
            name: 'Edit Tester'
        });

        // 2. Create Hub
        console.log('2. Creating Link Hub...');
        const hubRes = await client.post(`${BASE_URL}/hubs`, {
            title: 'Edit Test Hub',
            slug: `edit-hub-${Date.now()}`,
            description: 'Testing Edits'
        });
        hubId = hubRes.data.hub.id;

        // 3. Create Link
        console.log('3. Creating Link...');
        const linkRes = await client.post(`${BASE_URL}/hubs/${hubId}/links`, {
            title: 'Original Link',
            url: 'https://original.com',
            icon: 'link'
        });
        linkId = linkRes.data.link.id;

        // 4. Update Link
        console.log('4. Updating Link...');
        const updateLinkRes = await client.put(`${BASE_URL}/links/${linkId}`, {
            title: 'Updated Link',
            url: 'https://updated.com'
        });

        if (updateLinkRes.data.link.title === 'Updated Link' && updateLinkRes.data.link.url === 'https://updated.com') {
            console.log('✅ Link Updated Successfully');
        } else {
            throw new Error('Link update failed response validation');
        }

        // 5. Create Rule
        console.log('5. Creating Rule...');
        const ruleRes = await client.post(`${BASE_URL}/hubs/${hubId}/rules`, {
            name: 'Original Rule',
            priority: 1,
            conditions: [{ type: 'DEVICE_TYPE', devices: ['mobile'] }],
            actions: [{ type: 'SHOW_LINK', linkId }]
        });
        ruleId = ruleRes.data.rule.id;

        // 6. Update Rule
        console.log('6. Updating Rule...');
        const updateRuleRes = await client.put(`${BASE_URL}/hubs/${hubId}/rules/${ruleId}`, {
            name: 'Updated Rule',
            conditions: [{ type: 'DEVICE_TYPE', devices: ['desktop'] }]
        });

        const updatedConditions = typeof updateRuleRes.data.rule.conditions === 'string'
            ? JSON.parse(updateRuleRes.data.rule.conditions)
            : updateRuleRes.data.rule.conditions;

        if (updateRuleRes.data.rule.name === 'Updated Rule' && updatedConditions[0].devices[0] === 'desktop') {
            console.log('✅ Rule Updated Successfully');
        } else {
            throw new Error('Rule update failed response validation');
        }

        console.log('🎉 EDIT VERIFICATION SUCCESSFUL');

    } catch (error: any) {
        console.error('❌ Test Failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

testEditFunctionality();
