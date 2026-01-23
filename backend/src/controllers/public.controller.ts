import { Request, Response } from 'express';
import prisma from '../config/db';

// GET /api/public/:username/:slug
export const getPublicHub = async (req: Request, res: Response) => {
    try {
        const { username, slug } = req.params;

        const hub = await prisma.linkHub.findUnique({
            where: { slug },
            include: {
                user: { select: { id: true, name: true, avatar: true, username: true } },
                links: {
                    where: { isActive: true },
                    orderBy: { position: 'asc' }
                }
            }
        });

        if (!hub || !hub.isActive) {
            return res.status(404).json({ message: 'Hub not found or inactive' });
        }

        // Strict Username Check
        if (hub.user.username !== username) {
            return res.status(404).json({ message: 'Hub not found for this user' });
        }

        // Async: Record visit
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        prisma.visit.create({
            data: {
                hubId: hub.id,
                ipAddress: ip as string,
                userAgent: userAgent,
                deviceType: 'desktop'
            }
        }).catch(err => console.error('Failed to log visit', err));

        res.json({ hub });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
