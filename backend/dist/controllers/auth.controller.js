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
exports.updateProfile = exports.getMe = exports.logout = exports.login = exports.register = void 0;
const zod_1 = require("zod");
const db_1 = __importDefault(require("../config/db"));
const auth_utils_1 = require("../utils/auth.utils");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
const updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    username: zod_1.z.string().min(3).regex(/^[a-z0-9_-]+$/, 'Username must be alphanumeric').optional(),
});
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name } = registerSchema.parse(req.body);
        const userExists = yield db_1.default.user.findUnique({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Generate username from email (e.g., vyomgarg from vyomgarg@gmail.com)
        let baseUsername = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase();
        let username = baseUsername;
        let counter = 1;
        // Ensure uniqueness
        while (yield db_1.default.user.findUnique({ where: { username } })) {
            username = `${baseUsername}${counter}`;
            counter++;
        }
        const hashedPassword = yield (0, auth_utils_1.hashPassword)(password);
        const user = yield db_1.default.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                name,
                username,
            },
            select: { id: true, email: true, name: true, avatar: true, username: true }
        });
        const token = (0, auth_utils_1.generateToken)(user.id);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: 'strict'
        });
        res.status(201).json({ user });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = yield db_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = yield (0, auth_utils_1.comparePassword)(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = (0, auth_utils_1.generateToken)(user.id);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'strict'
        });
        res.json({ user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, username: user.username } });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
});
exports.login = login;
const logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out' });
};
exports.logout = logout;
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // req.user is populated by middleware, but might not have username if token is old (though we rely on DB fetch in middleware typically, let's ensure we return full user obj)
    // Assuming middleware fetches full user. If middleware uses JWT payload only, we might need to fetch again.
    // Let's assume middleware fetches from DB.
    res.json({ user: req.user });
});
exports.getMe = getMe;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, username } = updateProfileSchema.parse(req.body);
        if (username) {
            // Check uniqueness if changing
            if (username !== req.user.username) {
                const existing = yield db_1.default.user.findUnique({ where: { username } });
                if (existing) {
                    return res.status(400).json({ message: 'Username already taken' });
                }
            }
        }
        const updatedUser = yield db_1.default.user.update({
            where: { id: req.user.id },
            data: { name, username },
            select: { id: true, email: true, name: true, avatar: true, username: true }
        });
        res.json({ user: updatedUser });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
});
exports.updateProfile = updateProfile;
//# sourceMappingURL=auth.controller.js.map