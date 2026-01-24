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
function testRegistration() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log('--- Testing Registration ---');
        const email = `test_reg_${Date.now()}@example.com`;
        const password = 'password123';
        try {
            console.log('1. Attempting Registration...');
            const res = yield client.post(`${BASE_URL}/auth/register`, {
                email,
                password,
                name: 'Test User'
            });
            if (res.status === 201 && res.data.user.email === email) {
                console.log('✅ Registration Successful');
                console.log(`User ID: ${res.data.user.id}`);
                console.log(`Username: ${res.data.user.username}`);
            }
            else {
                throw new Error('Registration response invalid');
            }
            console.log('2. Attempting Login with same credentials...');
            const loginRes = yield client.post(`${BASE_URL}/auth/login`, { email, password });
            if (loginRes.status === 200) {
                console.log('✅ Login Successful');
            }
            else {
                throw new Error('Login failed');
            }
        }
        catch (error) {
            console.error('❌ Test Failed:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            process.exit(1);
        }
    });
}
testRegistration();
//# sourceMappingURL=test-registration.js.map