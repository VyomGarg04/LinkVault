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
exports.trackLinkClick = exports.reorderLinks = exports.deleteLink = exports.updateLink = exports.createLink = exports.getHubLinks = void 0;
const zod_1 = require("zod");
const db_1 = __importDefault(require("../config/db"));
const createLinkSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    url: zod_1.z.string().url(),
    icon: zod_1.z.string().optional(),
    style: zod_1.z.string().optional(), // JSON
});
const updateLinkSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    url: zod_1.z.string().url().optional(),
    icon: zod_1.z.string().optional(),
    style: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
    position: zod_1.z.number().optional(),
});
// GET /api/hubs/:hubId/links
const getHubLinks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hub = yield db_1.default.linkHub.findUnique({ where: { id: req.params.hubId } });
        if (!hub)
            return res.status(404).json({ message: 'Hub not found' });
        if (hub.userId !== req.user.id)
            return res.status(403).json({ message: 'Not authorized' });
        const links = yield db_1.default.link.findMany({
            where: {
                hubId: req.params.hubId,
                deletedAt: null
            },
            orderBy: { position: 'asc' }
        });
        res.json({ links });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getHubLinks = getHubLinks;
// POST /api/hubs/:hubId/links
const createLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hub = yield db_1.default.linkHub.findUnique({ where: { id: req.params.hubId } });
        if (!hub)
            return res.status(404).json({ message: 'Hub not found' });
        if (hub.userId !== req.user.id)
            return res.status(403).json({ message: 'Not authorized' });
        const data = createLinkSchema.parse(req.body);
        const maxPosition = yield db_1.default.link.findFirst({
            where: { hubId: req.params.hubId },
            orderBy: { position: 'desc' },
        });
        const position = maxPosition ? maxPosition.position + 1 : 0;
        const link = yield db_1.default.link.create({
            data: Object.assign(Object.assign({}, data), { hubId: req.params.hubId, position })
        });
        res.status(201).json({ link });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
});
exports.createLink = createLink;
// PUT /api/links/:id
const updateLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const link = yield db_1.default.link.findUnique({
            where: { id: req.params.id },
            include: { hub: true }
        });
        if (!link)
            return res.status(404).json({ message: 'Link not found' });
        if (link.hub.userId !== req.user.id)
            return res.status(403).json({ message: 'Not authorized' });
        const data = updateLinkSchema.parse(req.body);
        const updatedLink = yield db_1.default.link.update({
            where: { id: req.params.id },
            data
        });
        res.json({ link: updatedLink });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateLink = updateLink;
// DELETE /api/links/:id
const deleteLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const link = yield db_1.default.link.findUnique({
            where: { id: req.params.id },
            include: { hub: true }
        });
        if (!link)
            return res.status(404).json({ message: 'Link not found' });
        if (link.hub.userId !== req.user.id)
            return res.status(403).json({ message: 'Not authorized' });
        yield db_1.default.link.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date() }
        });
        res.json({ message: 'Link deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteLink = deleteLink;
// PUT /api/links/reorder (Batch update)
const reorderLinks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { links } = req.body; // Expects array of { id: string, position: number }
        if (!Array.isArray(links)) {
            return res.status(400).json({ message: 'Invalid payload' });
        }
        const firstLink = yield db_1.default.link.findUnique({ where: { id: links[0].id }, include: { hub: true } });
        if (!firstLink || firstLink.hub.userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        // Use transaction
        yield db_1.default.$transaction(links.map((link) => db_1.default.link.update({
            where: { id: link.id },
            data: { position: link.position }
        })));
        res.json({ message: 'Links reordered successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.reorderLinks = reorderLinks;
// POST /api/links/:id/click
const trackLinkClick = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const link = yield db_1.default.link.findUnique({ where: { id } });
        if (!link)
            return res.status(404).json({ message: 'Link not found' });
        // Increment click count
        yield db_1.default.link.update({
            where: { id },
            data: { clickCount: { increment: 1 } }
        });
        // Record detailed click
        yield db_1.default.click.create({
            data: {
                linkId: id,
            }
        });
        res.json({ message: 'Click recorded' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.trackLinkClick = trackLinkClick;
//# sourceMappingURL=link.controller.js.map