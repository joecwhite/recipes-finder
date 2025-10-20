import { Router } from 'express';
import { handleRecipeSearch } from '../controllers/recipeController';

const router = Router();

/**
 * POST /api/recipes/search
 * Search for recipes based on query and config
 */
router.post('/search', handleRecipeSearch);

export default router;
