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
function testAuth() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        console.log('--- Starting Auth Test ---');
        const email = `test_${Date.now()}@example.com`;
        const password = 'password123';
        try {
            // 1. Register
            console.log('1. Registering user...');
            const regRes = yield client.post(`${BASE_URL}/auth/register`, {
                email,
                password,
                name: 'Test User'
            });
            console.log('✅ Register Success:', regRes.status, regRes.data.user.email);
            // 2. Get Me (Session should be active via cookie)
            console.log('2. Getting Current User...');
            const meRes = yield client.get(`${BASE_URL}/auth/me`);
            console.log('✅ Get Me Success:', meRes.status, meRes.data.user.email);
            // 3. Logout
            console.log('3. Logging out...');
            const logoutRes = yield client.post(`${BASE_URL}/auth/logout`);
            console.log('✅ Logout Success:', logoutRes.status);
            // 4. Get Me (Should fail)
            console.log('4. Verifying Logout (Getting Current User)...');
            try {
                yield client.get(`${BASE_URL}/auth/me`);
                console.error('❌ Logout Failed: Still able to access protected route');
            }
            catch (error) {
                if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                    console.log('✅ Verification Success: Access denied as expected (401)');
                }
                else {
                    console.error('❌ Unexpected error:', error.message);
                }
            }
            // 5. Login
            console.log('5. Logging in again...');
            const loginRes = yield client.post(`${BASE_URL}/auth/login`, {
                email,
                password
            });
            console.log('✅ Login Success:', loginRes.status);
        }
        catch (error) {
            console.error('❌ Test Failed:', ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
        }
    });
}
testAuth();
//# sourceMappingURL=test-auth.js.map