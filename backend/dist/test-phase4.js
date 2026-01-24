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
function testPhase4() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        console.log('--- Testing Phase 4: Username & Settings ---');
        const timestamp = Date.now();
        const email = `phase4_${timestamp}@example.com`; // expected username: phase4_TIMESTAMP
        const password = 'password123';
        try {
            // 1. Register & Verify Generated Username
            console.log('1. Registering...');
            yield client.post(`${BASE_URL}/auth/register`, { email, password, name: 'Phase 4 User' });
            // Explicit login to ensure cookie
            yield client.post(`${BASE_URL}/auth/login`, { email, password });
            const meRes = yield client.get(`${BASE_URL}/auth/me`);
            const generatedUsername = meRes.data.user.username;
            console.log(`✅ Generated Username: ${generatedUsername}`);
            if (!generatedUsername) {
                throw new Error('Username generation failed');
            }
            // 2. Create Hub
            yield client.post(`${BASE_URL}/hubs`, { title: 'User Hub', slug: `hub-${timestamp}` });
            // 3. Test Public Access (Correct Username)
            console.log('3. Testing Public Access (Valid)...');
            const publicClient = axios_1.default.create();
            yield publicClient.get(`${BASE_URL}/public/${generatedUsername}/hub-${timestamp}`);
            console.log('✅ Access allowed');
            // 4. Test Public Access (Wrong Username)
            console.log('4. Testing Public Access (Invalid Username)...');
            try {
                yield publicClient.get(`${BASE_URL}/public/wronguser/hub-${timestamp}`);
                throw new Error('Should have failed access');
            }
            catch (e) {
                if (((_a = e.response) === null || _a === void 0 ? void 0 : _a.status) === 404)
                    console.log('✅ Access denied correctly');
                else
                    throw e;
            }
            // 5. Update Profile (Change Username)
            console.log('5. Updating Username...');
            const newUsername = `newuser${timestamp}`;
            const updateRes = yield client.put(`${BASE_URL}/auth/profile`, { username: newUsername });
            const updatedUsername = updateRes.data.user.username;
            if (updatedUsername !== newUsername)
                throw new Error('Update failed');
            console.log('✅ Username updated');
            // 6. Verify New URL works
            console.log('6. Verifying New URL...');
            yield publicClient.get(`${BASE_URL}/public/${newUsername}/hub-${timestamp}`);
            console.log('✅ New URL working');
            console.log('🎉 PHASE 4 VERIFICATION SUCCESSFUL');
        }
        catch (error) {
            console.error('❌ Test Failed:', ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
            process.exit(1);
        }
    });
}
testPhase4();
//# sourceMappingURL=test-phase4.js.map