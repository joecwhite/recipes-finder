import { Request, Response } from 'express';
import { handleChatMessage } from '../services/claudeService';
import { logger } from '../utils/logger';
import type { ChatMessageRequest, ChatMessageResponse } from '../../../shared/types';

/**
 * Handle chat message requests
 * POST /api/chat
 */
export async function handleChat(req: Request, res: Response): Promise<void> {
  try {
    const { message, conversationHistory, lastRecipe }: ChatMessageRequest = req.body;

    // Validate request
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'Message is required and must be a non-empty string' });
      return;
    }

    logger.info('Chat request received', { message: message.slice(0, 50) });

    // Get response from Claude
    const responseMessage = await handleChatMessage(message, conversationHistory, lastRecipe);

    const response: ChatMessageResponse = {
      message: responseMessage,
      type: 'text',
    };

    res.status(200).json(response);
  } catch (error: any) {
    logger.error('Chat request failed', { error: error.message });

    if (error.name === 'ClaudeAPIError') {
      res.status(503).json({ error: 'AI service temporarily unavailable' });
      return;
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}
