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
function testPhase2() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log('--- Starting Phase 2 Test (Hubs & Links) ---');
        const email = `test_p2_${Date.now()}@example.com`;
        const password = 'password123';
        let hubId = '';
        let linkId = '';
        try {
            // 1. Auth
            console.log('1. Registering/Login...');
            yield client.post(`${BASE_URL}/auth/register`, {
                email,
                password,
                name: 'Phase 2 Tester'
            });
            // 2. Create Hub
            console.log('2. Creating Link Hub...');
            const hubRes = yield client.post(`${BASE_URL}/hubs`, {
                title: 'My Test Hub',
                slug: `test-hub-${Date.now()}`,
                description: 'Testing CRUD'
            });
            hubId = hubRes.data.hub.id;
            console.log('✅ Hub Created:', hubId);
            // 3. Get Hubs
            console.log('3. Fetching My Hubs...');
            const hubsRes = yield client.get(`${BASE_URL}/hubs`);
            if (hubsRes.data.hubs.length > 0 && hubsRes.data.hubs[0].id === hubId) {
                console.log('✅ Hub listed correctly');
            }
            else {
                throw new Error('Hub not found in list');
            }
            // 4. Add Link
            console.log('4. Adding Link to Hub...');
            const linkRes = yield client.post(`${BASE_URL}/hubs/${hubId}/links`, {
                title: 'Google',
                url: 'https://google.com',
                icon: 'search'
            });
            linkId = linkRes.data.link.id;
            console.log('✅ Link Created:', linkId);
            // 5. Get Links
            console.log('5. Fetching Hub Links...');
            const linksRes = yield client.get(`${BASE_URL}/hubs/${hubId}/links`);
            if (linksRes.data.links.length === 1 && linksRes.data.links[0].id === linkId) {
                console.log('✅ Link listed correctly');
            }
            else {
                throw new Error('Link not found in list');
            }
            // 6. Update Link
            console.log('6. Updating Link...');
            yield client.put(`${BASE_URL}/links/${linkId}`, {
                title: 'Google Updated'
            });
            console.log('✅ Link Updated');
            // 7. Delete Link
            console.log('7. Deleting Link...');
            yield client.delete(`${BASE_URL}/links/${linkId}`);
            console.log('✅ Link Deleted');
            // 8. Delete Hub
            console.log('8. Deleting Hub...');
            yield client.delete(`${BASE_URL}/hubs/${hubId}`);
            console.log('✅ Hub Deleted');
            console.log('🎉 PHASE 2 VERIFICATION SUCCESSFUL');
        }
        catch (error) {
            console.error('❌ Test Failed:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            process.exit(1);
        }
    });
}
testPhase2();
//# sourceMappingURL=test-phase2.js.map