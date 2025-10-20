import { Request, Response } from 'express';
import { searchForRecipe } from '../services/searchService';
import { logger } from '../utils/logger';
import type { RecipeSearchRequest, RecipeSearchResponse } from '../../../shared/types';

/**
 * Handle recipe search requests
 * POST /api/recipes/search
 */
export async function handleRecipeSearch(req: Request, res: Response): Promise<void> {
  try {
    const { query, config }: RecipeSearchRequest = req.body;

    // Validate request
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({ error: 'Query is required and must be a non-empty string' });
      return;
    }

    if (!config || typeof config !== 'object') {
      res.status(400).json({ error: 'Config is required' });
      return;
    }

    if (config.servings < 1 || config.servings > 8) {
      res.status(400).json({ error: 'Servings must be between 1 and 8' });
      return;
    }

    logger.info('Recipe search request received', { query, config });

    // Perform search
    const result = await searchForRecipe(query, config);

    const response: RecipeSearchResponse = {
      recipe: result.recipe,
      searchTime: result.searchTime,
      cached: result.cached,
    };

    res.status(200).json(response);
  } catch (error: any) {
    logger.error('Recipe search request failed', { error: error.message });

    if (error.name === 'RecipeNotFoundError') {
      res.status(404).json({ error: error.message });
      return;
    }

    if (error.name === 'ClaudeAPIError') {
      res.status(503).json({ error: 'AI service temporarily unavailable' });
      return;
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}
