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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportUserData = exports.deleteAccount = exports.changePassword = exports.updateProfile = exports.getUserStats = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("../config/db"));
const zod_1 = require("zod");
// Schemas
const updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    username: zod_1.z.string().min(3).optional(),
    avatar: zod_1.z.string().optional(), // Base64 or URL
});
const changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(6),
});
// GET /api/users/stats
const getUserStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const [hubCount, linkCount, totalClicks] = yield Promise.all([
            db_1.default.linkHub.count({ where: { userId } }),
            db_1.default.link.count({ where: { hub: { userId }, isActive: true } }),
            db_1.default.click.count({ where: { link: { hub: { userId } } } })
        ]);
        res.json({
            stats: {
                hubs: hubCount,
                links: linkCount,
                clicks: totalClicks
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getUserStats = getUserStats;
// PUT /api/users/profile
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, username, avatar } = updateProfileSchema.parse(req.body);
        const userId = req.user.id;
        // Check username uniqueness if changing
        if (username) {
            const existing = yield db_1.default.user.findUnique({ where: { username } });
            if (existing && existing.id !== userId) {
                return res.status(400).json({ message: 'Username already taken' });
            }
        }
        const user = yield db_1.default.user.update({
            where: { id: userId },
            data: {
                name,
                username,
                avatar
            }
        });
        res.json({ user: { id: user.id, name: user.name, email: user.email, username: user.username, avatar: user.avatar } });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const errorMessage = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
            return res.status(400).json({ message: errorMessage });
        }
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: error.message });
    }
});
exports.updateProfile = updateProfile;
// PUT /api/users/password
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
        const userId = req.user.id;
        const user = yield db_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const isMatch = yield bcryptjs_1.default.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        const passwordHash = yield bcryptjs_1.default.hash(newPassword, salt);
        yield db_1.default.user.update({
            where: { id: userId },
            data: { passwordHash }
        });
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const errorMessage = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
            return res.status(400).json({ message: errorMessage });
        }
        res.status(500).json({ message: error.message });
    }
});
exports.changePassword = changePassword;
// DELETE /api/users/me
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        yield db_1.default.user.delete({ where: { id: userId } });
        res.json({ message: 'Account deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteAccount = deleteAccount;
// GET /api/users/export
const exportUserData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const user = yield db_1.default.user.findUnique({
            where: { id: userId },
            include: {
                linkHubs: {
                    include: {
                        links: true,
                        rules: true
                    }
                }
            }
        });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        // Remove sensitive data
        const { passwordHash } = user, safeUser = __rest(user, ["passwordHash"]);
        const exportData = Object.assign(Object.assign({}, safeUser), { exportDate: new Date().toISOString(), version: '1.0' });
        res.json(exportData);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.exportUserData = exportUserData;
//# sourceMappingURL=user.controller.js.map