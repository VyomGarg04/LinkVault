import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';

// Schemas
const updateProfileSchema = z.object({
    name: z.string().min(1).optional(),
    username: z.string().min(3).optional(),
    avatar: z.string().optional(), // Base64 or URL
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
});

// GET /api/users/stats
export const getUserStats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;

        const [hubCount, linkCount, totalClicks] = await Promise.all([
            prisma.linkHub.count({ where: { userId } }),
            prisma.link.count({ where: { hub: { userId }, isActive: true } }),
            prisma.click.count({ where: { link: { hub: { userId } } } })
        ]);

        res.json({
            stats: {
                hubs: hubCount,
                links: linkCount,
                clicks: totalClicks
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/users/profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { name, username, avatar } = updateProfileSchema.parse(req.body);
        const userId = req.user.id;

        // Check username uniqueness if changing
        if (username) {
            const existing = await prisma.user.findUnique({ where: { username } });
            if (existing && existing.id !== userId) {
                return res.status(400).json({ message: 'Username already taken' });
            }
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                username,
                avatar
            }
        });

        res.json({ user: { id: user.id, name: user.name, email: user.email, username: user.username, avatar: user.avatar } });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            const errorMessage = error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
            return res.status(400).json({ message: errorMessage });
        }
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/users/password
export const changePassword = async (req: AuthRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
        const userId = req.user.id;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash }
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            const errorMessage = error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
            return res.status(400).json({ message: errorMessage });
        }
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/users/me
export const deleteAccount = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        await prisma.user.delete({ where: { id: userId } });
        res.json({ message: 'Account deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/users/export
export const exportUserData = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
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

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Remove sensitive data
        const { passwordHash, ...safeUser } = user;

        const exportData = {
            ...safeUser,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        res.json(exportData);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
