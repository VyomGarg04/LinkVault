import express from 'express';
import { getMyHubs, createHub, getHubById, updateHub, deleteHub } from '../controllers/hub.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect as any); // Protect all routes in this file

router.get('/', getMyHubs as any);
router.post('/', createHub as any);
router.get('/:id', getHubById as any);
router.put('/:id', updateHub as any);
router.delete('/:id', deleteHub as any);

export default router;
