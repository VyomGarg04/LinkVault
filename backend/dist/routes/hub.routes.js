"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const hub_controller_1 = require("../controllers/hub.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rule_controller_1 = require("../controllers/rule.controller");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect); // Protect all routes in this file
// Hub Routes
router.get('/', hub_controller_1.getMyHubs);
router.post('/', hub_controller_1.createHub);
router.get('/:id', hub_controller_1.getHubById);
router.put('/:id', hub_controller_1.updateHub);
router.delete('/:id', hub_controller_1.deleteHub);
router.get('/:id/export', hub_controller_1.exportHubData);
// Rule Routes
router.post('/:id/rules', rule_controller_1.createRule);
router.get('/:id/rules', rule_controller_1.getRules);
router.put('/:id/rules/:ruleId', rule_controller_1.updateRule);
router.delete('/:id/rules/:ruleId', rule_controller_1.deleteRule);
exports.default = router;
//# sourceMappingURL=hub.routes.js.map