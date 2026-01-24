"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.get('/stats', user_controller_1.getUserStats);
router.put('/profile', user_controller_1.updateProfile);
router.put('/password', user_controller_1.changePassword);
router.delete('/me', user_controller_1.deleteAccount);
router.get('/export', user_controller_1.exportUserData);
exports.default = router;
//# sourceMappingURL=user.routes.js.map