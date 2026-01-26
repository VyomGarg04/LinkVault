import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.utils';
import prisma from '../config/db';

export interface AuthRequest extends Request {
    user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        console.log('[AuthMiddleware] No token found in cookies. Cookies:', req.cookies);
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = verifyToken(token);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, name: true, avatar: true, username: true }
        });

        if (!user) {
            console.log('[AuthMiddleware] User not found for ID:', decoded.userId);
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('[AuthMiddleware] Token verification failed:', error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};
