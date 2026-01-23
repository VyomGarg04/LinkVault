import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.utils';
import { AuthRequest } from '../middleware/auth.middleware';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

const updateProfileSchema = z.object({
    name: z.string().optional(),
    username: z.string().min(3).regex(/^[a-z0-9_-]+$/, 'Username must be alphanumeric').optional(),
});

export const register = async (req: AuthRequest, res: Response) => {
    try {
        const { email, password, name } = registerSchema.parse(req.body);

        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate username from email (e.g., vyomgarg from vyomgarg@gmail.com)
        let baseUsername = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase();
        let username = baseUsername;
        let counter = 1;

        // Ensure uniqueness
        while (await prisma.user.findUnique({ where: { username } })) {
            username = `${baseUsername}${counter}`;
            counter++;
        }

        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                name,
                username,
            },
            select: { id: true, email: true, name: true, avatar: true, username: true }
        });

        const token = generateToken(user.id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: 'strict'
        });

        res.status(201).json({ user });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req: AuthRequest, res: Response) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await comparePassword(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user.id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'strict'
        });

        res.json({ user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, username: user.username } });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
};

export const logout = (req: AuthRequest, res: Response) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out' });
};

export const getMe = async (req: AuthRequest, res: Response) => {
    // req.user is populated by middleware, but might not have username if token is old (though we rely on DB fetch in middleware typically, let's ensure we return full user obj)
    // Assuming middleware fetches full user. If middleware uses JWT payload only, we might need to fetch again.
    // Let's assume middleware fetches from DB.
    res.json({ user: req.user });
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { name, username } = updateProfileSchema.parse(req.body);

        if (username) {
            // Check uniqueness if changing
            if (username !== req.user.username) {
                const existing = await prisma.user.findUnique({ where: { username } });
                if (existing) {
                    return res.status(400).json({ message: 'Username already taken' });
                }
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { name, username },
            select: { id: true, email: true, name: true, avatar: true, username: true }
        });

        res.json({ user: updatedUser });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
};
