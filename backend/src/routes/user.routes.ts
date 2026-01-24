import express from 'express';
import { changePassword, deleteAccount, getUserStats, updateProfile, exportUserData } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect as any);

router.get('/stats', getUserStats as any);
router.put('/profile', updateProfile as any);
router.put('/password', changePassword as any);
router.delete('/me', deleteAccount as any);
router.get('/export', exportUserData as any);

export default router;
