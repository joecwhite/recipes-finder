import { Router } from 'express';
import { handleChat } from '../controllers/chatController';

const router = Router();

/**
 * POST /api/chat
 * Handle chat messages with conversation context
 */
router.post('/', handleChat);

export default router;
