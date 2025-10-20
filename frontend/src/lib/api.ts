import type {
  Recipe,
  SearchConfig,
  RecipeSearchRequest,
  RecipeSearchResponse,
  ChatMessageRequest,
  ChatMessageResponse,
} from '../../../shared/types';

const API_BASE_URL = '/api';

/**
 * Search for recipes based on query and configuration
 */
export async function searchRecipes(
  query: string,
  config: SearchConfig
): Promise<RecipeSearchResponse> {
  const request: RecipeSearchRequest = { query, config };

  const response = await fetch(`${API_BASE_URL}/recipes/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to search recipes');
  }

  return response.json();
}

/**
 * Send a chat message
 */
export async function sendChatMessage(
  message: string,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>,
  lastRecipe?: Recipe
): Promise<ChatMessageResponse> {
  const request: ChatMessageRequest = {
    message,
    conversationHistory,
    lastRecipe,
  };

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send message');
  }

  return response.json();
}

/**
 * Check API health
 */
export async function checkHealth(): Promise<{ status: string; cache: any }> {
  const response = await fetch(`/health`);

  if (!response.ok) {
    throw new Error('Health check failed');
  }

  return response.json();
}
