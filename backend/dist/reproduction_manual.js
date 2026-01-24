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
const API_URL = 'http://localhost:3001/api';
function testAuth() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Testing Authentication...');
        const email = `testuser_${Date.now()}@example.com`;
        const password = 'password123';
        try {
            // 1. Register
            console.log(`\nAttempting to register user: ${email}`);
            const regRes = yield axios_1.default.post(`${API_URL}/auth/register`, {
                email,
                password,
                name: 'Test User'
            });
            console.log('✅ Registration Successful:', regRes.status, regRes.data.user.email);
            // 2. Login
            console.log('\nAttempting to login...');
            const loginRes = yield axios_1.default.post(`${API_URL}/auth/login`, {
                email,
                password
            });
            console.log('✅ Login Successful:', loginRes.status, loginRes.data.user.email);
        }
        catch (error) {
            console.error('❌ Auth Failed:');
            if (error.code)
                console.error('Code:', error.code);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
            }
            else {
                console.error('Message:', error.message);
                console.error('Full Error:', error);
            }
        }
    });
}
testAuth();
//# sourceMappingURL=reproduction_manual.js.map