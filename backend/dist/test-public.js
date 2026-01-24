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
function testPublic() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log('--- Testing Public View & Unique Slugs ---');
        const email = `test_public_${Date.now()}@example.com`;
        const password = 'password123';
        const slug = `public-hub-${Date.now()}`;
        let hubId = '';
        let linkId = '';
        try {
            // 1. Setup Data
            console.log('1. Setting up Hub with Links...');
            yield client.post(`${BASE_URL}/auth/register`, { email, password, name: 'Public Tester' });
            // Explicit login to ensure cookie
            yield client.post(`${BASE_URL}/auth/login`, { email, password });
            const hubRes = yield client.post(`${BASE_URL}/hubs`, { title: 'My Public Hub', slug });
            hubId = hubRes.data.hub.id;
            const linkRes = yield client.post(`${BASE_URL}/hubs/${hubId}/links`, { title: 'Public Link', url: 'https://example.com' });
            linkId = linkRes.data.link.id;
            // 2. Fetch Public Hub (Unauthenticated)
            console.log('2. Fetching Public Hub anonymously...');
            const publicClient = axios_1.default.create();
            const publicRes = yield publicClient.get(`${BASE_URL}/public/hubs/${slug}`);
            if (publicRes.data.hub.title === 'My Public Hub') {
                console.log('✅ Public Hub fetched successfully');
            }
            else {
                throw new Error('Public Hub data mismatch');
            }
            // 3. Track Click
            console.log('3. Tracking Click...');
            yield publicClient.post(`${BASE_URL}/public/links/${linkId}/click`);
            console.log('✅ Click tracked');
            // 4. Verify Unique Slug Enforcement
            console.log('4. Verifying Slug Uniqueness...');
            try {
                yield client.post(`${BASE_URL}/hubs`, { title: 'Duplicate Hub', slug });
                throw new Error('Duplicate slug was allowed!');
            }
            catch (e) {
                if (e.response && e.response.status === 400) {
                    console.log('✅ Duplicate slug rejected properly');
                }
                else {
                    throw e;
                }
            }
            console.log('🎉 PHASE 3 VERIFICATION SUCCESSFUL');
        }
        catch (error) {
            console.error('❌ Test Failed:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            process.exit(1);
        }
    });
}
testPublic();
//# sourceMappingURL=test-public.js.map