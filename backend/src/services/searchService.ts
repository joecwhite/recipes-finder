import { logger } from '../utils/logger';
import { getCachedRecipe, cacheRecipe } from './cacheService';
import { generateSearchStrategy, analyzeAndSelectBestRecipe } from './claudeService';
import { scrapeRecipes } from './mockScraperService';
import { scaleRecipeServings } from '../utils/servingScaler';
import type { Recipe, SearchConfig, RecipeNotFoundError } from '../../../shared/types';

/**
 * Main recipe search orchestrator
 * Coordinates cache, Claude API, and scraping to find the best recipe
 */
export async function searchForRecipe(
  query: string,
  config: SearchConfig
): Promise<{ recipe: Recipe; cached: boolean; searchTime: number }> {
  const startTime = Date.now();

  logger.info('Recipe search started', { query, config });

  // Step 1: Check cache
  const cachedRecipe = getCachedRecipe(query, config);
  if (cachedRecipe) {
    const searchTime = Date.now() - startTime;
    logger.info('Recipe search completed (cached)', { query, searchTime });
    return {
      recipe: cachedRecipe,
      cached: true,
      searchTime,
    };
  }

  try {
    // Step 2: Generate search strategy using Claude
    logger.info('Generating search strategy', { query });
    const searchConfig = { ...config, originalQuery: query };
    const strategy = await generateSearchStrategy(query, searchConfig);

    logger.info('Search strategy generated', {
      keywords: strategy.keywords,
      sources: strategy.sources.length,
    });

    // Step 3: Scrape recipes from sources (mock in MVP)
    logger.info('Scraping recipes', { query });
    const candidates = await scrapeRecipes(strategy);

    if (candidates.length === 0) {
      throw new Error('No recipes found') as RecipeNotFoundError;
    }

    logger.info('Recipes scraped', { count: candidates.length });

    // Step 4: Analyze and select best recipe using Claude
    logger.info('Analyzing recipes', { query, candidatesCount: candidates.length });
    const selectedRecipe = await analyzeAndSelectBestRecipe(candidates, searchConfig);

    // Step 5: Scale recipe to desired servings
    const scaledRecipe =
      selectedRecipe.servings !== config.servings
        ? scaleRecipeServings(selectedRecipe, config.servings)
        : selectedRecipe;

    // Step 6: Cache the result
    cacheRecipe(query, config, scaledRecipe);

    const searchTime = Date.now() - startTime;
    logger.info('Recipe search completed', { query, searchTime, cached: false });

    return {
      recipe: scaledRecipe,
      cached: false,
      searchTime,
    };
  } catch (error) {
    const searchTime = Date.now() - startTime;
    logger.error('Recipe search failed', { error, query, searchTime });
    throw error;
  }
}
