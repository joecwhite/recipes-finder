import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import type {
  Recipe,
  SearchConfig,
  SearchStrategy,
  ScrapedRecipe,
  ClaudeAPIError,
} from '../../../shared/types';

// Claude model types
export const ClaudeModel = {
  SONNET: 'claude-3-5-sonnet-20241022' as const,
  HAIKU: 'claude-3-haiku-20240307' as const,
};

// Initialize Anthropic client
const client = new Anthropic({
  apiKey: config.anthropicApiKey,
});

/**
 * Generate search strategy using Claude
 * Uses Claude to determine best keywords and sources for the query
 */
export async function generateSearchStrategy(
  query: string,
  searchConfig: SearchConfig
): Promise<SearchStrategy> {
  const systemPrompt = `You are a recipe search strategist. Given a user's recipe query and preferences, generate optimal search keywords and target sources.

Return your response as a valid JSON object with this structure:
{
  "keywords": ["keyword1", "keyword2"],
  "sources": [
    {
      "platform": "Instagram",
      "accounts": ["@account1", "@account2"],
      "hashtags": ["#recipe", "#highprotein"]
    }
  ]
}`;

  const userPrompt = `
Query: "${query}"
Preferences:
- High protein: ${searchConfig.proteinPriority ? 'YES' : 'NO'}
- High fiber: ${searchConfig.fiberPriority ? 'YES' : 'NO'}
- Servings: ${searchConfig.servings}

Preferred chefs to prioritize:
- Emily English (@emilyenglishnutrition) - Nutrition-focused
- Gordon Ramsay (@gordongram) - Professional techniques
- Jamie Oliver (@jamieoliver) - Healthy home cooking
- Yotam Ottolenghi (@ottolenghi) - Vegetable-forward
- Notorious Foodie (@notoriousfoodie) - Modern creative

Generate search strategy as JSON. Focus on finding recipes that match the nutritional priorities.`;

  try {
    const response = await client.messages.create({
      model: ClaudeModel.SONNET,
      max_tokens: 2048,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    logger.info('Search strategy generated', {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    });

    return JSON.parse(content.text);
  } catch (error) {
    logger.error('Failed to generate search strategy', { error, query });
    throw new ClaudeAPIError('search_strategy_failed', 'Failed to generate search strategy');
  }
}

/**
 * Analyze scraped recipes and select the best one
 * Uses Claude to evaluate recipes based on quality and nutritional alignment
 */
export async function analyzeAndSelectBestRecipe(
  candidates: ScrapedRecipe[],
  searchConfig: SearchConfig
): Promise<Recipe> {
  const systemPrompt = `You are an expert recipe analyzer specializing in nutritional optimization.

YOUR ROLE:
- Evaluate recipes for completeness, quality, and nutritional value
- Prioritize recipes matching user's dietary preferences
- Extract and standardize recipe information
- Remove all non-essential content (ads, stories, engagement prompts)

OUTPUT FORMAT:
Return a single JSON object with this exact structure:
{
  "name": "Recipe Name",
  "servings": 2,
  "prepTime": 15,
  "cookTime": 30,
  "ingredients": [
    {"quantity": "2 cups", "name": "chicken breast", "notes": "diced"}
  ],
  "instructions": [
    "Step 1: Do something",
    "Step 2: Do something else"
  ],
  "nutrition": {
    "protein": 35,
    "fiber": 8,
    "calories": 450
  },
  "source": {
    "platform": "Instagram",
    "author": "Emily English",
    "url": "https://..."
  }
}

EVALUATION CRITERIA:
1. Nutritional alignment with user preferences (30% weight)
2. Recipe completeness - all ingredients and steps (30% weight)
3. Instruction clarity and detail (20% weight)
4. Source credibility (preferred chefs) (20% weight)

CONTENT FILTERING:
- Remove: ads, personal anecdotes, engagement prompts, sponsors
- Keep: recipe name, ingredients, instructions, nutrition, cooking tips`;

  const userPrompt = `
SEARCH QUERY: "${searchConfig.originalQuery || 'recipe search'}"

DIETARY PRIORITIES:
${searchConfig.proteinPriority ? '✓ HIGH PROTEIN (>25g per serving)' : '○ Normal protein'}
${searchConfig.fiberPriority ? '✓ HIGH FIBER (>8g per serving)' : '○ Normal fiber'}

TARGET SERVINGS: ${searchConfig.servings} person(s)

CANDIDATE RECIPES (${candidates.length} total):
${candidates
  .map(
    (c, i) => `
--- Recipe ${i + 1} ---
Source: ${c.platform} - ${c.author}
URL: ${c.url}
Content: ${c.rawContent.slice(0, 1500)}...
`
  )
  .join('\n')}

TASK:
1. Analyze each recipe for quality and nutritional alignment
2. Rank recipes based on evaluation criteria
3. Select the SINGLE BEST recipe
4. Extract and standardize the recipe in JSON format
5. Scale ingredients to ${searchConfig.servings} serving(s)
6. Remove all extraneous content

Return ONLY the JSON object, no additional text.`;

  try {
    const response = await client.messages.create({
      model: ClaudeModel.SONNET,
      max_tokens: 4096,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    logger.info('Recipe analyzed and selected', {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      candidatesAnalyzed: candidates.length,
    });

    // Parse the JSON response
    const cleanedText = content.text.trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('No valid JSON found in Claude response');
    }

    const recipe: Recipe = JSON.parse(jsonMatch[0]);

    return recipe;
  } catch (error) {
    logger.error('Failed to analyze recipes', { error, candidatesCount: candidates.length });
    throw new ClaudeAPIError('recipe_analysis_failed', 'Failed to analyze and select recipe');
  }
}

/**
 * Handle chat messages with conversation context
 * Uses Claude Haiku for fast, cost-effective responses
 */
export async function handleChatMessage(
  message: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  lastRecipe?: Recipe
): Promise<string> {
  const systemPrompt = `You are a helpful cooking assistant for the Recipe Finder application. Answer questions about recipes, cooking techniques, and ingredient substitutions. Be concise, friendly, and helpful.`;

  const contextMessage = lastRecipe
    ? `\n\nContext: User is currently viewing this recipe:\nName: ${lastRecipe.name}\nIngredients: ${lastRecipe.ingredients.map((i) => i.name).join(', ')}`
    : '';

  const messages = [
    ...conversationHistory,
    {
      role: 'user' as const,
      content: message + contextMessage,
    },
  ];

  try {
    const response = await client.messages.create({
      model: ClaudeModel.HAIKU,
      max_tokens: 1024,
      temperature: 0.7,
      system: systemPrompt,
      messages: messages,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    logger.info('Chat message handled', {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    });

    return content.text;
  } catch (error) {
    logger.error('Failed to handle chat message', { error, message });
    throw new ClaudeAPIError('chat_failed', 'Failed to process chat message');
  }
}

/**
 * Retry logic with exponential backoff for API calls
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Don't retry on authentication or invalid request errors
      if (error.type === 'authentication_error' || error.type === 'invalid_request_error') {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delayMs = Math.pow(2, attempt) * 1000;
      logger.warn(`Retry attempt ${attempt + 1} after ${delayMs}ms`, { error: error.message });
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error(`Failed after ${maxRetries} retries: ${lastError.message}`);
}
