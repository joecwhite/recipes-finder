/**
 * Shared TypeScript types for Recipe Finder application
 * Used by both frontend and backend
 */

// ============================================================================
// Recipe Types
// ============================================================================

export interface Ingredient {
  quantity: string;
  name: string;
  notes?: string;
}

export interface NutritionInfo {
  protein: number; // grams
  fiber: number; // grams
  calories: number;
}

export interface RecipeSource {
  platform: 'Instagram' | 'TikTok' | 'YouTube' | 'Web';
  author: string;
  url: string;
}

export interface Recipe {
  name: string;
  servings: number;
  prepTime?: number; // minutes
  cookTime?: number; // minutes
  ingredients: Ingredient[];
  instructions: string[];
  nutrition?: NutritionInfo;
  source: RecipeSource;
}

// ============================================================================
// Search Configuration Types
// ============================================================================

export interface SearchConfig {
  proteinPriority: boolean;
  fiberPriority: boolean;
  servings: number; // 1-8
  originalQuery?: string;
}

export interface SearchStrategy {
  keywords: string[];
  sources: SourceTarget[];
}

export interface SourceTarget {
  platform: 'Instagram' | 'TikTok' | 'YouTube' | 'Web';
  accounts?: string[]; // Specific chef accounts to check
  hashtags?: string[];
  searchTerms?: string[];
}

// ============================================================================
// Scraped Content Types
// ============================================================================

export interface ScrapedRecipe {
  platform: 'Instagram' | 'TikTok' | 'YouTube' | 'Web';
  author: string;
  url: string;
  rawContent: string;
  timestamp: number;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface RecipeSearchRequest {
  query: string;
  config: SearchConfig;
}

export interface RecipeSearchResponse {
  recipe: Recipe;
  searchTime: number; // milliseconds
  cached: boolean;
}

export interface ChatMessageRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  lastRecipe?: Recipe;
}

export interface ChatMessageResponse {
  message: string;
  type: 'text' | 'recipe' | 'error';
  recipe?: Recipe;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// ============================================================================
// Error Types
// ============================================================================

export class RecipeNotFoundError extends Error {
  constructor(query: string) {
    super(`No recipes found for query: "${query}"`);
    this.name = 'RecipeNotFoundError';
  }
}

export class ScraperError extends Error {
  constructor(
    public platform: string,
    public originalError: Error
  ) {
    super(`Failed to scrape ${platform}: ${originalError.message}`);
    this.name = 'ScraperError';
  }
}

export class ClaudeAPIError extends Error {
  constructor(
    public type: string,
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ClaudeAPIError';
  }
}

// ============================================================================
// Cache Types
// ============================================================================

export interface CachedRecipe {
  queryHash: string;
  query: string;
  config: SearchConfig;
  recipe: Recipe;
  createdAt: number;
  accessedAt: number;
  accessCount: number;
}

export interface CachedContent {
  url: string;
  platform: string;
  content: string;
  createdAt: number;
  expiresAt: number;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface AppConfig {
  anthropicApiKey: string;
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
}

export interface ClaudeModel {
  SONNET: 'claude-3-5-sonnet-20241022';
  HAIKU: 'claude-3-haiku-20240307';
}

// ============================================================================
// Utility Types
// ============================================================================

export type Platform = 'Instagram' | 'TikTok' | 'YouTube' | 'Web';

export interface PreferredChef {
  name: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  specialty: string;
}

export const PREFERRED_CHEFS: PreferredChef[] = [
  {
    name: 'Emily English',
    instagram: '@emilyenglishnutrition',
    specialty: 'Nutrition-focused recipes',
  },
  {
    name: 'Gordon Ramsay',
    instagram: '@gordongram',
    tiktok: '@gordonramsayofficial',
    youtube: '@GordonRamsay',
    specialty: 'Professional cooking techniques',
  },
  {
    name: 'Jamie Oliver',
    instagram: '@jamieoliver',
    youtube: '@JamieOliver',
    specialty: 'Healthy home cooking',
  },
  {
    name: 'Yotam Ottolenghi',
    instagram: '@ottolenghi',
    specialty: 'Vegetable-forward dishes',
  },
  {
    name: 'Notorious Foodie',
    instagram: '@notoriousfoodie',
    tiktok: '@notoriousfoodie',
    specialty: 'Modern creative recipes',
  },
];
