"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const link_controller_1 = require("../controllers/link.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect); // Protect all routes
router.get('/hubs/:hubId/links', link_controller_1.getHubLinks);
router.post('/hubs/:hubId/links', link_controller_1.createLink);
router.put('/links/reorder', link_controller_1.reorderLinks);
router.put('/links/:id', link_controller_1.updateLink);
router.delete('/links/:id', link_controller_1.deleteLink);
exports.default = router;
//# sourceMappingURL=link.routes.js.map