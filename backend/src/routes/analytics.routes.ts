import express from 'express';
import { getHubAnalytics } from '../controllers/analytics.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect as any);

router.get('/:id', getHubAnalytics as any);

export default router;
