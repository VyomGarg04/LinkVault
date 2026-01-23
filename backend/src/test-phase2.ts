import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

const BASE_URL = 'http://localhost:3001/api';

async function testPhase2() {
  console.log('--- Starting Phase 2 Test (Hubs & Links) ---');
  const email = `test_p2_${Date.now()}@example.com`;
  const password = 'password123';
  let hubId = '';
  let linkId = '';

  try {
    // 1. Auth
    console.log('1. Registering/Login...');
    await client.post(`${BASE_URL}/auth/register`, {
      email,
      password,
      name: 'Phase 2 Tester'
    });

    // 2. Create Hub
    console.log('2. Creating Link Hub...');
    const hubRes = await client.post(`${BASE_URL}/hubs`, {
      title: 'My Test Hub',
      slug: `test-hub-${Date.now()}`,
      description: 'Testing CRUD'
    });
    hubId = hubRes.data.hub.id;
    console.log('✅ Hub Created:', hubId);

    // 3. Get Hubs
    console.log('3. Fetching My Hubs...');
    const hubsRes = await client.get(`${BASE_URL}/hubs`);
    if (hubsRes.data.hubs.length > 0 && hubsRes.data.hubs[0].id === hubId) {
      console.log('✅ Hub listed correctly');
    } else {
      throw new Error('Hub not found in list');
    }

    // 4. Add Link
    console.log('4. Adding Link to Hub...');
    const linkRes = await client.post(`${BASE_URL}/hubs/${hubId}/links`, {
      title: 'Google',
      url: 'https://google.com',
      icon: 'search'
    });
    linkId = linkRes.data.link.id;
    console.log('✅ Link Created:', linkId);

    // 5. Get Links
    console.log('5. Fetching Hub Links...');
    const linksRes = await client.get(`${BASE_URL}/hubs/${hubId}/links`);
    if (linksRes.data.links.length === 1 && linksRes.data.links[0].id === linkId) {
      console.log('✅ Link listed correctly');
    } else {
      throw new Error('Link not found in list');
    }

    // 6. Update Link
    console.log('6. Updating Link...');
    await client.put(`${BASE_URL}/links/${linkId}`, {
      title: 'Google Updated'
    });
    console.log('✅ Link Updated');

    // 7. Delete Link
    console.log('7. Deleting Link...');
    await client.delete(`${BASE_URL}/links/${linkId}`);
    console.log('✅ Link Deleted');

    // 8. Delete Hub
    console.log('8. Deleting Hub...');
    await client.delete(`${BASE_URL}/hubs/${hubId}`);
    console.log('✅ Hub Deleted');

    console.log('🎉 PHASE 2 VERIFICATION SUCCESSFUL');

  } catch (error: any) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testPhase2();
