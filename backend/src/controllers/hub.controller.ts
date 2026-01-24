import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';

const createHubSchema = z.object({
    title: z.string().min(1),
    slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric and hyphens only'),
    description: z.string().optional(),
    theme: z.string().optional(), // JSON string for SQLite
});

const updateHubSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    theme: z.string().optional(),
    isActive: z.boolean().optional(),
});

// GET /api/hubs
export const getMyHubs = async (req: AuthRequest, res: Response) => {
    try {
        const hubs = await prisma.linkHub.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { links: true, visits: true } }
            }
        });
        res.json({ hubs });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/hubs
export const createHub = async (req: AuthRequest, res: Response) => {
    try {
        const data = createHubSchema.parse(req.body);

        const existingHub = await prisma.linkHub.findUnique({
            where: { slug: data.slug }
        });

        if (existingHub) {
            return res.status(400).json({ message: 'Hub with this slug already exists' });
        }

        const hub = await prisma.linkHub.create({
            data: {
                ...data,
                userId: req.user.id,
                theme: data.theme || "{}"
            }
        });

        res.status(201).json({ hub });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
};

// GET /api/hubs/:id
export const getHubById = async (req: AuthRequest, res: Response) => {
    try {
        const hub = await prisma.linkHub.findUnique({
            where: { id: req.params.id },
            include: { links: { orderBy: { position: 'asc' } } }
        });

        if (!hub) return res.status(404).json({ message: 'Hub not found' });
        if (hub.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        res.json({ hub });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/hubs/:id
export const updateHub = async (req: AuthRequest, res: Response) => {
    try {
        const data = updateHubSchema.parse(req.body);
        const hub = await prisma.linkHub.findUnique({ where: { id: req.params.id } });

        if (!hub) return res.status(404).json({ message: 'Hub not found' });
        if (hub.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        const updatedHub = await prisma.linkHub.update({
            where: { id: req.params.id },
            data
        });

        res.json({ hub: updatedHub });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/hubs/:id
export const deleteHub = async (req: AuthRequest, res: Response) => {
    try {
        const hub = await prisma.linkHub.findUnique({ where: { id: req.params.id } });

        if (!hub) return res.status(404).json({ message: 'Hub not found' });
        if (hub.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        await prisma.linkHub.delete({ where: { id: req.params.id } });

        res.json({ message: 'Hub deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/hubs/:id/export
export const exportHubData = async (req: AuthRequest, res: Response) => {
    try {
        const hubId = req.params.id;
        const hub = await prisma.linkHub.findUnique({
            where: { id: hubId },
            include: {
                links: { orderBy: { position: 'asc' } },
                rules: true
            }
        });

        if (!hub) return res.status(404).json({ message: 'Hub not found' });
        if (hub.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        const exportData = {
            ...hub,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        res.json(exportData);
    } catch (error: any) {
        console.error("Hub Export Error:", error);
        res.status(500).json({ message: error.message });
    }
};
