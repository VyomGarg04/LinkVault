import express from 'express';
import { getMyHubs, createHub, getHubById, updateHub, deleteHub, exportHubData } from '../controllers/hub.controller';
import { protect } from '../middleware/auth.middleware';

import { createRule, getRules, updateRule, deleteRule } from '../controllers/rule.controller';

const router = express.Router();

router.use(protect as any); // Protect all routes in this file

// Hub Routes
router.get('/', getMyHubs as any);
router.post('/', createHub as any);
router.get('/:id', getHubById as any);
router.put('/:id', updateHub as any);
router.delete('/:id', deleteHub as any);
router.get('/:id/export', exportHubData as any);

// Rule Routes
router.post('/:id/rules', createRule as any);
router.get('/:id/rules', getRules as any);
router.put('/:id/rules/:ruleId', updateRule as any);
router.delete('/:id/rules/:ruleId', deleteRule as any);

export default router;
