import express from 'express';
import { register, login, logout, getMe, updateProfile } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', register as any);
router.post('/login', login as any);
router.post('/logout', logout as any);
router.get('/me', protect as any, getMe as any);
router.put('/profile', protect as any, updateProfile as any);

export default router;
