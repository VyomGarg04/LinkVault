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
function testAvatar() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log('--- Testing Avatar Update ---');
        const email = `test_avatar_${Date.now()}@example.com`;
        const password = 'password123';
        let hubId = '';
        try {
            // 1. Register
            yield client.post(`${BASE_URL}/auth/register`, {
                email,
                password,
                name: 'Avatar Tester'
            });
            // 2. Create Hub
            const hubRes = yield client.post(`${BASE_URL}/hubs`, {
                title: 'Avatar Hub',
                slug: `avatar-hub-${Date.now()}`
            });
            hubId = hubRes.data.hub.id;
            console.log('✅ Hub Created:', hubId);
            // 3. Update Theme (Avatar)
            const avatarUrl = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';
            const themeString = JSON.stringify({ avatar: avatarUrl });
            yield client.put(`${BASE_URL}/hubs/${hubId}`, {
                theme: themeString
            });
            console.log('✅ Avatar Updated');
            // 4. Verify Persistence
            const getRes = yield client.get(`${BASE_URL}/hubs/${hubId}`);
            const fetchedTheme = JSON.parse(getRes.data.hub.theme);
            if (fetchedTheme.avatar === avatarUrl) {
                console.log('✅ Avatar Persistence Verified');
            }
            else {
                throw new Error('Avatar mismatch');
            }
        }
        catch (error) {
            console.error('❌ Test Failed:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            process.exit(1);
        }
    });
}
testAvatar();
//# sourceMappingURL=test-avatar.js.map