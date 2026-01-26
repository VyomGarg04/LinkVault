import { Response, Request } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';

const createLinkSchema = z.object({
    title: z.string().min(1),
    url: z.string().url(),
    icon: z.string().optional(),
    style: z.string().optional(), // JSON
});

const updateLinkSchema = z.object({
    title: z.string().min(1).optional(),
    url: z.string().url().optional(),
    icon: z.string().optional(),
    style: z.string().optional(),
    isActive: z.boolean().optional(),
    position: z.number().optional(),
});

// GET /api/hubs/:hubId/links
export const getHubLinks = async (req: AuthRequest, res: Response) => {
    try {
        const hub = await prisma.linkHub.findUnique({ where: { id: req.params.hubId } });

        if (!hub) return res.status(404).json({ message: 'Hub not found' });
        if (hub.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        const links = await prisma.link.findMany({
            where: {
                hubId: req.params.hubId,
                deletedAt: null
            },
            orderBy: { position: 'asc' }
        });

        res.json({ links });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/hubs/:hubId/links
export const createLink = async (req: AuthRequest, res: Response) => {
    try {
        const hub = await prisma.linkHub.findUnique({ where: { id: req.params.hubId } });

        if (!hub) return res.status(404).json({ message: 'Hub not found' });
        if (hub.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        const data = createLinkSchema.parse(req.body);

        const maxPosition = await prisma.link.findFirst({
            where: { hubId: req.params.hubId },
            orderBy: { position: 'desc' },
        });

        const position = maxPosition ? maxPosition.position + 1 : 0;

        const link = await prisma.link.create({
            data: {
                ...data,
                style: data.style || JSON.stringify({ bgColor: '#0f172a', textColor: '#ffffff' }), // Default Dark Theme
                hubId: req.params.hubId,
                position,
            }
        });

        res.status(201).json({ link });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/links/:id
export const updateLink = async (req: AuthRequest, res: Response) => {
    try {
        const link = await prisma.link.findUnique({
            where: { id: req.params.id },
            include: { hub: true }
        });

        if (!link) return res.status(404).json({ message: 'Link not found' });
        if (link.hub.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        const data = updateLinkSchema.parse(req.body);

        const updatedLink = await prisma.link.update({
            where: { id: req.params.id },
            data
        });

        res.json({ link: updatedLink });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/links/:id
export const deleteLink = async (req: AuthRequest, res: Response) => {
    try {
        const link = await prisma.link.findUnique({
            where: { id: req.params.id },
            include: { hub: true }
        });

        if (!link) return res.status(404).json({ message: 'Link not found' });
        if (link.hub.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        await prisma.link.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date() }
        });

        res.json({ message: 'Link deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/hubs/:hubId/links/style (Batch Style Update)
export const updateLinksStyle = async (req: AuthRequest, res: Response) => {
    try {
        const { style } = req.body;
        const { hubId } = req.params;

        // Verify ownership
        const hub = await prisma.linkHub.findUnique({ where: { id: hubId } });
        if (!hub) return res.status(404).json({ message: 'Hub not found' });
        if (hub.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        await prisma.link.updateMany({
            where: {
                hubId,
                deletedAt: null
            },
            data: { style }
        });

        res.json({ message: 'All links updated successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/links/reorder (Batch update)
export const reorderLinks = async (req: AuthRequest, res: Response) => {
    try {
        const { links } = req.body; // Expects array of { id: string, position: number }

        if (!Array.isArray(links)) {
            return res.status(400).json({ message: 'Invalid payload' });
        }

        const firstLink = await prisma.link.findUnique({ where: { id: links[0].id }, include: { hub: true } });
        if (!firstLink || firstLink.hub.userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Use transaction
        await prisma.$transaction(
            links.map((link: any) =>
                prisma.link.update({
                    where: { id: link.id },
                    data: { position: link.position }
                })
            )
        );

        res.json({ message: 'Links reordered successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

// POST /api/links/:id/click
export const trackLinkClick = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const link = await prisma.link.findUnique({ where: { id } });
        if (!link) return res.status(404).json({ message: 'Link not found' });

        // Increment click count
        await prisma.link.update({
            where: { id },
            data: { clickCount: { increment: 1 } }
        });

        // Record detailed click
        await prisma.click.create({
            data: {
                linkId: id,
            }
        });

        res.json({ message: 'Click recorded' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
