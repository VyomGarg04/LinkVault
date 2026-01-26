import express from 'express';
import { getHubLinks, createLink, updateLink, deleteLink, reorderLinks, updateLinksStyle } from '../controllers/link.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect as any); // Protect all routes

router.get('/hubs/:hubId/links', getHubLinks as any);
router.post('/hubs/:hubId/links', createLink as any);
router.put('/hubs/:hubId/links/style', updateLinksStyle as any);
router.put('/links/reorder', reorderLinks as any);
router.put('/links/:id', updateLink as any);
router.delete('/links/:id', deleteLink as any);

export default router;
