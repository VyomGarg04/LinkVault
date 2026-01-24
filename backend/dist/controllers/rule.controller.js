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
exports.deleteRule = exports.updateRule = exports.getRules = exports.createRule = void 0;
const zod_1 = require("zod");
const db_1 = __importDefault(require("../config/db"));
// Validation Schemas
const conditionSchema = zod_1.z.object({
    type: zod_1.z.enum(['TIME_RANGE', 'DATE_RANGE', 'DEVICE_TYPE', 'DAYS_OF_WEEK']),
    // Time conditions
    startTime: zod_1.z.string().optional(),
    endTime: zod_1.z.string().optional(),
    timezone: zod_1.z.string().optional(),
    // Date conditions
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    // Device conditions
    devices: zod_1.z.array(zod_1.z.string()).optional(),
    // Days conditions
    days: zod_1.z.array(zod_1.z.number()).optional(), // 0-6 or 1-7
});
const actionSchema = zod_1.z.object({
    type: zod_1.z.enum(['SHOW_LINK', 'HIDE_LINK', 'REDIRECT']),
    linkId: zod_1.z.string().optional(),
    url: zod_1.z.string().optional(),
});
const ruleSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    priority: zod_1.z.number().int().default(0),
    conditions: zod_1.z.array(conditionSchema),
    actions: zod_1.z.array(actionSchema),
    isActive: zod_1.z.boolean().default(true),
});
// Create Rule
const createRule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id: hubId } = req.params;
        const { name, priority, conditions, actions, isActive } = ruleSchema.parse(req.body);
        // Verify ownership
        const hub = yield db_1.default.linkHub.findUnique({
            where: { id: hubId, userId: req.user.id }
        });
        if (!hub) {
            return res.status(404).json({ message: 'Hub not found or unauthorized' });
        }
        const rule = yield db_1.default.rule.create({
            data: {
                hubId,
                name,
                priority,
                isActive,
                conditions: JSON.stringify(conditions),
                actions: JSON.stringify(actions),
            }
        });
        res.status(201).json({ rule });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
});
exports.createRule = createRule;
// Get Rules for Hub
const getRules = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id: hubId } = req.params;
        // Verify ownership
        const hub = yield db_1.default.linkHub.findUnique({
            where: { id: hubId, userId: req.user.id }
        });
        if (!hub)
            return res.status(404).json({ message: 'Hub not found' });
        const rules = yield db_1.default.rule.findMany({
            where: { hubId },
            orderBy: { priority: 'desc' }
        });
        // Parse JSON fields
        const parsedRules = rules.map(r => (Object.assign(Object.assign({}, r), { conditions: JSON.parse(r.conditions), actions: JSON.parse(r.actions) })));
        res.json({ rules: parsedRules });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getRules = getRules;
// Update Rule
const updateRule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, ruleId } = req.params; // hubId, ruleId
        const data = ruleSchema.partial().parse(req.body);
        // Verify ownership via rule -> hub -> user
        const existingRule = yield db_1.default.rule.findFirst({
            where: { id: ruleId, hubId: id, hub: { userId: req.user.id } }
        });
        if (!existingRule)
            return res.status(404).json({ message: 'Rule not found' });
        const updateData = Object.assign({}, data);
        if (data.conditions)
            updateData.conditions = JSON.stringify(data.conditions);
        if (data.actions)
            updateData.actions = JSON.stringify(data.actions);
        const rule = yield db_1.default.rule.update({
            where: { id: ruleId },
            data: updateData
        });
        res.json({ rule: Object.assign(Object.assign({}, rule), { conditions: JSON.parse(rule.conditions), actions: JSON.parse(rule.actions) }) });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
});
exports.updateRule = updateRule;
// Delete Rule
const deleteRule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, ruleId } = req.params;
        const existingRule = yield db_1.default.rule.findFirst({
            where: { id: ruleId, hubId: id, hub: { userId: req.user.id } }
        });
        if (!existingRule)
            return res.status(404).json({ message: 'Rule not found' });
        yield db_1.default.rule.delete({ where: { id: ruleId } });
        res.json({ message: 'Rule deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteRule = deleteRule;
//# sourceMappingURL=rule.controller.js.map