"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const public_controller_1 = require("../controllers/public.controller");
const link_controller_1 = require("../controllers/link.controller");
const router = express_1.default.Router();
// Public Hub Data
router.get('/:username/:slug', public_controller_1.getPublicHub);
// Track Clicks (Public)
router.post('/links/:id/click', link_controller_1.trackLinkClick);
exports.default = router;
//# sourceMappingURL=public.routes.js.map