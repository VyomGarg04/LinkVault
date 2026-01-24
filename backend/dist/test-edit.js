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
function testEditFunctionality() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log('--- Starting Edit Functionality Test (Links & Rules) ---');
        const email = `test_edit_${Date.now()}@example.com`;
        const password = 'password123';
        let hubId = '';
        let linkId = '';
        let ruleId = '';
        try {
            // 1. Auth
            console.log('1. Registering/Login...');
            yield client.post(`${BASE_URL}/auth/register`, {
                email,
                password,
                name: 'Edit Tester'
            });
            // 2. Create Hub
            console.log('2. Creating Link Hub...');
            const hubRes = yield client.post(`${BASE_URL}/hubs`, {
                title: 'Edit Test Hub',
                slug: `edit-hub-${Date.now()}`,
                description: 'Testing Edits'
            });
            hubId = hubRes.data.hub.id;
            // 3. Create Link
            console.log('3. Creating Link...');
            const linkRes = yield client.post(`${BASE_URL}/hubs/${hubId}/links`, {
                title: 'Original Link',
                url: 'https://original.com',
                icon: 'link'
            });
            linkId = linkRes.data.link.id;
            // 4. Update Link
            console.log('4. Updating Link...');
            const updateLinkRes = yield client.put(`${BASE_URL}/links/${linkId}`, {
                title: 'Updated Link',
                url: 'https://updated.com'
            });
            if (updateLinkRes.data.link.title === 'Updated Link' && updateLinkRes.data.link.url === 'https://updated.com') {
                console.log('✅ Link Updated Successfully');
            }
            else {
                throw new Error('Link update failed response validation');
            }
            // 5. Create Rule
            console.log('5. Creating Rule...');
            const ruleRes = yield client.post(`${BASE_URL}/hubs/${hubId}/rules`, {
                name: 'Original Rule',
                priority: 1,
                conditions: [{ type: 'DEVICE_TYPE', devices: ['mobile'] }],
                actions: [{ type: 'SHOW_LINK', linkId }]
            });
            ruleId = ruleRes.data.rule.id;
            // 6. Update Rule
            console.log('6. Updating Rule...');
            const updateRuleRes = yield client.put(`${BASE_URL}/hubs/${hubId}/rules/${ruleId}`, {
                name: 'Updated Rule',
                conditions: [{ type: 'DEVICE_TYPE', devices: ['desktop'] }]
            });
            const updatedConditions = typeof updateRuleRes.data.rule.conditions === 'string'
                ? JSON.parse(updateRuleRes.data.rule.conditions)
                : updateRuleRes.data.rule.conditions;
            if (updateRuleRes.data.rule.name === 'Updated Rule' && updatedConditions[0].devices[0] === 'desktop') {
                console.log('✅ Rule Updated Successfully');
            }
            else {
                throw new Error('Rule update failed response validation');
            }
            console.log('🎉 EDIT VERIFICATION SUCCESSFUL');
        }
        catch (error) {
            console.error('❌ Test Failed:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            process.exit(1);
        }
    });
}
testEditFunctionality();
//# sourceMappingURL=test-edit.js.map