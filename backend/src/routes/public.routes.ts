import express from 'express';
import { getPublicHub } from '../controllers/public.controller';
import { trackLinkClick } from '../controllers/link.controller';

const router = express.Router();

// Public Hub Data
router.get('/:username/:slug', getPublicHub as any);

// Track Clicks (Public)
router.post('/links/:id/click', trackLinkClick as any);

export default router;
