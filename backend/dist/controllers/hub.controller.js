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
exports.exportHubData = exports.deleteHub = exports.updateHub = exports.getHubById = exports.createHub = exports.getMyHubs = void 0;
const zod_1 = require("zod");
const db_1 = __importDefault(require("../config/db"));
const createHubSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(3).regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric and hyphens only'),
    description: zod_1.z.string().optional(),
    theme: zod_1.z.string().optional(), // JSON string for SQLite
});
const updateHubSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    theme: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
});
// GET /api/hubs
const getMyHubs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hubs = yield db_1.default.linkHub.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                links: { where: { deletedAt: null } },
                _count: {
                    select: { visits: true }
                }
            }
        });
        // Manually calculate counts and sanitize response
        const hubsWithCounts = hubs.map(hub => {
            var _a;
            return (Object.assign(Object.assign({}, hub), { links: undefined, _count: {
                    links: hub.links.length,
                    visits: ((_a = hub._count) === null || _a === void 0 ? void 0 : _a.visits) || 0
                } }));
        });
        res.json({ hubs: hubsWithCounts });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getMyHubs = getMyHubs;
// POST /api/hubs
const createHub = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = createHubSchema.parse(req.body);
        const existingHub = yield db_1.default.linkHub.findUnique({
            where: { slug: data.slug }
        });
        if (existingHub) {
            return res.status(400).json({ message: 'Hub with this slug already exists' });
        }
        const hub = yield db_1.default.linkHub.create({
            data: Object.assign(Object.assign({}, data), { userId: req.user.id, theme: data.theme || "{}" })
        });
        res.status(201).json({ hub });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
});
exports.createHub = createHub;
// GET /api/hubs/:id
const getHubById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hub = yield db_1.default.linkHub.findUnique({
            where: { id: req.params.id },
            include: {
                links: {
                    where: { deletedAt: null },
                    orderBy: { position: 'asc' }
                }
            }
        });
        if (!hub)
            return res.status(404).json({ message: 'Hub not found' });
        if (hub.userId !== req.user.id)
            return res.status(403).json({ message: 'Not authorized' });
        res.json({ hub });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getHubById = getHubById;
// PUT /api/hubs/:id
const updateHub = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = updateHubSchema.parse(req.body);
        const hub = yield db_1.default.linkHub.findUnique({ where: { id: req.params.id } });
        if (!hub)
            return res.status(404).json({ message: 'Hub not found' });
        if (hub.userId !== req.user.id)
            return res.status(403).json({ message: 'Not authorized' });
        const updatedHub = yield db_1.default.linkHub.update({
            where: { id: req.params.id },
            data
        });
        res.json({ hub: updatedHub });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateHub = updateHub;
// DELETE /api/hubs/:id
const deleteHub = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hub = yield db_1.default.linkHub.findUnique({ where: { id: req.params.id } });
        if (!hub)
            return res.status(404).json({ message: 'Hub not found' });
        if (hub.userId !== req.user.id)
            return res.status(403).json({ message: 'Not authorized' });
        yield db_1.default.linkHub.delete({ where: { id: req.params.id } });
        res.json({ message: 'Hub deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteHub = deleteHub;
// GET /api/hubs/:id/export
const exportHubData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hubId = req.params.id;
        const hub = yield db_1.default.linkHub.findUnique({
            where: { id: hubId },
            include: {
                links: {
                    where: { deletedAt: null },
                    orderBy: { position: 'asc' }
                },
                rules: true
            }
        });
        if (!hub)
            return res.status(404).json({ message: 'Hub not found' });
        if (hub.userId !== req.user.id)
            return res.status(403).json({ message: 'Not authorized' });
        const exportData = Object.assign(Object.assign({}, hub), { exportDate: new Date().toISOString(), version: '1.0' });
        res.json(exportData);
    }
    catch (error) {
        console.error("Hub Export Error:", error);
        res.status(500).json({ message: error.message });
    }
});
exports.exportHubData = exportHubData;
//# sourceMappingURL=hub.controller.js.map