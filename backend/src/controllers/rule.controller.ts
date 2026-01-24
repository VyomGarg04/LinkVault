import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';

// Validation Schemas
const conditionSchema = z.object({
    type: z.enum(['TIME_RANGE', 'DATE_RANGE', 'DEVICE_TYPE', 'DAYS_OF_WEEK']),
    // Time conditions
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    timezone: z.string().optional(),
    // Date conditions
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    // Device conditions
    devices: z.array(z.string()).optional(),
    // Days conditions
    days: z.array(z.number()).optional(), // 0-6 or 1-7
});

const actionSchema = z.object({
    type: z.enum(['SHOW_LINK', 'HIDE_LINK', 'REDIRECT']),
    linkId: z.string().optional(),
    url: z.string().optional(),
});

const ruleSchema = z.object({
    name: z.string().min(1),
    priority: z.number().int().default(0),
    conditions: z.array(conditionSchema),
    actions: z.array(actionSchema),
    isActive: z.boolean().default(true),
});

// Create Rule
export const createRule = async (req: AuthRequest, res: Response) => {
    try {
        const { id: hubId } = req.params;
        const { name, priority, conditions, actions, isActive } = ruleSchema.parse(req.body);

        // Verify ownership
        const hub = await prisma.linkHub.findUnique({
            where: { id: hubId, userId: req.user.id }
        });

        if (!hub) {
            return res.status(404).json({ message: 'Hub not found or unauthorized' });
        }

        const rule = await prisma.rule.create({
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
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
};

// Get Rules for Hub
export const getRules = async (req: AuthRequest, res: Response) => {
    try {
        const { id: hubId } = req.params;

        // Verify ownership
        const hub = await prisma.linkHub.findUnique({
            where: { id: hubId, userId: req.user.id }
        });
        if (!hub) return res.status(404).json({ message: 'Hub not found' });

        const rules = await prisma.rule.findMany({
            where: { hubId },
            orderBy: { priority: 'desc' }
        });

        // Parse JSON fields
        const parsedRules = rules.map(r => ({
            ...r,
            conditions: JSON.parse(r.conditions),
            actions: JSON.parse(r.actions)
        }));

        res.json({ rules: parsedRules });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Update Rule
export const updateRule = async (req: AuthRequest, res: Response) => {
    try {
        const { id, ruleId } = req.params; // hubId, ruleId
        const data = ruleSchema.partial().parse(req.body);

        // Verify ownership via rule -> hub -> user
        const existingRule = await prisma.rule.findFirst({
            where: { id: ruleId, hubId: id, hub: { userId: req.user.id } }
        });

        if (!existingRule) return res.status(404).json({ message: 'Rule not found' });

        const updateData: any = { ...data };
        if (data.conditions) updateData.conditions = JSON.stringify(data.conditions);
        if (data.actions) updateData.actions = JSON.stringify(data.actions);

        const rule = await prisma.rule.update({
            where: { id: ruleId },
            data: updateData
        });

        res.json({ rule: { ...rule, conditions: JSON.parse(rule.conditions), actions: JSON.parse(rule.actions) } });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
};

// Delete Rule
export const deleteRule = async (req: AuthRequest, res: Response) => {
    try {
        const { id, ruleId } = req.params;

        const existingRule = await prisma.rule.findFirst({
            where: { id: ruleId, hubId: id, hub: { userId: req.user.id } }
        });

        if (!existingRule) return res.status(404).json({ message: 'Rule not found' });

        await prisma.rule.delete({ where: { id: ruleId } });
        res.json({ message: 'Rule deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
