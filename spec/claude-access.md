# Claude API Integration Guide

## 1. Overview

This document provides comprehensive guidance on integrating Anthropic's Claude API into the Recipe Finder application. It covers authentication, model selection, API usage patterns, cost optimization, and best practices for prompt engineering.

## 2. Getting Started with Claude API

### 2.1 Prerequisites
- Active Anthropic account with Claude subscription
- API access enabled (available with Claude Pro subscription)
- API key generated from Console

### 2.2 API Key Setup

1. **Obtain API Key**
   - Navigate to: https://console.anthropic.com/settings/keys
   - Click "Create Key"
   - Name it: "Recipe Finder - Local"
   - Copy the key (shown only once!)

2. **Secure Storage**
   ```bash
   # Create .env file in project root
   ANTHROPIC_API_KEY=sk-ant-api03-xxx...

   # Add .env to .gitignore
   echo ".env" >> .gitignore
   ```

3. **Environment Variable Loading**
   ```typescript
   // backend/src/config/env.ts
   import dotenv from 'dotenv';

   dotenv.config();

   export const config = {
     anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
     environment: process.env.NODE_ENV || 'development',
   };

   // Validate on startup
   if (!config.anthropicApiKey) {
     throw new Error('ANTHROPIC_API_KEY is required');
   }
   ```

### 2.3 SDK Installation

```bash
npm install @anthropic-ai/sdk
```

```typescript
// backend/src/services/claudeService.ts
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/env';

const client = new Anthropic({
  apiKey: config.anthropicApiKey,
});
```

## 3. Claude Model Selection

### 3.1 Available Models

| Model | Best For | Cost (per 1M tokens) | Speed | Intelligence |
|-------|----------|---------------------|--------|--------------|
| **Claude 3.5 Sonnet** | Recipe analysis, content extraction | Input: $3, Output: $15 | Medium | Highest |
| **Claude 3 Opus** | Complex reasoning (overkill for this use case) | Input: $15, Output: $75 | Slow | Highest |
| **Claude 3 Haiku** | Simple tasks, chat responses | Input: $0.25, Output: $1.25 | Fast | Good |

### 3.2 Recommended Model Strategy

```typescript
enum ClaudeModel {
  SONNET = 'claude-3-5-sonnet-20241022',
  HAIKU = 'claude-3-haiku-20240307',
}

function selectModel(taskType: string): string {
  switch (taskType) {
    case 'recipe-search':
      return ClaudeModel.SONNET;  // Need intelligence for analysis
    case 'recipe-ranking':
      return ClaudeModel.SONNET;  // Critical quality assessment
    case 'chat-response':
      return ClaudeModel.HAIKU;   // Simple conversational replies
    case 'ingredient-scaling':
      return ClaudeModel.HAIKU;   // Math operations
    case 'clarification':
      return ClaudeModel.HAIKU;   // Quick questions
    default:
      return ClaudeModel.SONNET;  // Default to smarter model
  }
}
```

### 3.3 Cost Estimation

**Typical Usage Scenario:**
- Average recipe search: ~8,000 input tokens + ~2,000 output tokens
- Using Claude 3.5 Sonnet: $0.024 + $0.030 = **$0.054 per search**
- Expected usage: 10 searches/day = **~$16/month**

**Optimization with Haiku for Chat:**
- Simple chat response: ~500 input tokens + ~300 output tokens
- Using Claude 3 Haiku: $0.000125 + $0.000375 = **$0.0005 per chat**

## 4. API Usage Patterns

### 4.1 Basic Message Request

```typescript
interface MessageRequest {
  model: string;
  max_tokens: number;
  temperature?: number;
  system?: string;
  messages: Message[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

async function sendMessage(
  userMessage: string,
  systemPrompt: string,
  modelType: string = ClaudeModel.SONNET
): Promise<string> {
  const response = await client.messages.create({
    model: modelType,
    max_tokens: 4096,
    temperature: 0.7,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });

  return response.content[0].text;
}
```

### 4.2 Recipe Search Implementation

```typescript
async function searchRecipes(
  query: string,
  searchConfig: SearchConfig
): Promise<Recipe> {
  // Phase 1: Generate search strategy
  const searchStrategy = await generateSearchStrategy(query, searchConfig);

  // Phase 2: Scrape recipes from sources
  const candidates = await scrapeRecipes(searchStrategy);

  // Phase 3: Analyze and select best recipe
  const bestRecipe = await analyzeRecipes(candidates, searchConfig);

  return bestRecipe;
}

async function generateSearchStrategy(
  query: string,
  config: SearchConfig
): Promise<SearchStrategy> {
  const systemPrompt = `You are a recipe search strategist. Given a user's recipe query and preferences, generate optimal search keywords and target sources.`;

  const userPrompt = `
Query: "${query}"
Preferences:
- High protein: ${config.proteinPriority}
- High fiber: ${config.fiberPriority}
- Servings: ${config.servings}

Preferred chefs: Emily English, Gordon Ramsay, Jamie Oliver, Yotam Ottolenghi, Notorious Foodie

Generate search strategy as JSON:
{
  "keywords": ["keyword1", "keyword2"],
  "sources": [
    {
      "platform": "Instagram",
      "accounts": ["@emilyenglishnutrition"],
      "hashtags": ["#highprotein", "#recipe"]
    }
  ]
}`;

  const response = await sendMessage(
    userPrompt,
    systemPrompt,
    ClaudeModel.SONNET
  );

  return JSON.parse(response);
}
```

### 4.3 Recipe Analysis & Selection

```typescript
async function analyzeRecipes(
  candidates: ScrapedRecipe[],
  config: SearchConfig
): Promise<Recipe> {
  const systemPrompt = `You are an expert recipe analyzer. Evaluate recipes based on:
1. Completeness (ingredients, instructions)
2. Nutritional alignment (protein, fiber priorities)
3. Quality of instructions
4. Source credibility

Return the SINGLE BEST recipe in this exact JSON format:
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

Strip ALL extraneous content: ads, personal stories, engagement prompts, etc.
Only include essential recipe information.`;

  const userPrompt = `
Search Configuration:
- Protein priority: ${config.proteinPriority ? 'HIGH' : 'NORMAL'}
- Fiber priority: ${config.fiberPriority ? 'HIGH' : 'NORMAL'}
- Target servings: ${config.servings}

Candidate Recipes:
${JSON.stringify(candidates, null, 2)}

Analyze and return the BEST recipe as JSON.`;

  const response = await sendMessage(
    userPrompt,
    systemPrompt,
    ClaudeModel.SONNET
  );

  const recipe = JSON.parse(response);

  // Scale to requested servings
  return scaleRecipeServings(recipe, config.servings);
}
```

### 4.4 Conversational Chat

```typescript
async function handleChatMessage(
  message: string,
  conversationHistory: Message[],
  lastRecipe?: Recipe
): Promise<string> {
  const systemPrompt = `You are a helpful cooking assistant. Answer questions about recipes, cooking techniques, and ingredient substitutions. Be concise and friendly.`;

  const contextMessage = lastRecipe
    ? `\n\nContext: User is currently viewing this recipe:\n${lastRecipe.name}\nIngredients: ${lastRecipe.ingredients.map(i => i.name).join(', ')}`
    : '';

  const messages = [
    ...conversationHistory,
    {
      role: 'user' as const,
      content: message + contextMessage,
    },
  ];

  const response = await client.messages.create({
    model: ClaudeModel.HAIKU, // Fast and cheap for chat
    max_tokens: 1024,
    temperature: 0.7,
    system: systemPrompt,
    messages: messages,
  });

  return response.content[0].text;
}
```

## 5. Prompt Engineering Best Practices

### 5.1 System Prompt Design

**Effective System Prompts:**
- Define role clearly ("You are a recipe analyzer...")
- Specify output format explicitly (JSON structure)
- Set behavioral guidelines (strip extraneous content)
- Include evaluation criteria (nutrition, completeness)

**Example:**
```typescript
const RECIPE_ANALYZER_PROMPT = `You are an expert recipe analyzer specializing in nutritional optimization.

YOUR ROLE:
- Evaluate recipes for completeness, quality, and nutritional value
- Prioritize recipes matching user's dietary preferences
- Extract and standardize recipe information
- Remove all non-essential content (ads, stories, engagement prompts)

OUTPUT FORMAT:
Return a single JSON object with this exact structure:
{
  "name": string,
  "servings": number,
  "ingredients": [{"quantity": string, "name": string, "notes"?: string}],
  "instructions": string[],
  "nutrition"?: {"protein": number, "fiber": number, "calories": number},
  "source": {"platform": string, "author": string, "url": string}
}

EVALUATION CRITERIA:
1. Nutritional alignment with user preferences (30% weight)
2. Recipe completeness - all ingredients and steps (30% weight)
3. Instruction clarity and detail (20% weight)
4. Source credibility (preferred chefs) (20% weight)

CONTENT FILTERING:
- Remove: ads, personal anecdotes, engagement prompts, sponsors
- Keep: recipe name, ingredients, instructions, nutrition, cooking tips`;
```

### 5.2 User Prompt Design

**Effective User Prompts:**
- Provide clear context and constraints
- Structure data consistently (JSON for inputs)
- Be explicit about priorities
- Include examples for complex tasks

**Example:**
```typescript
function buildRecipeAnalysisPrompt(
  candidates: ScrapedRecipe[],
  config: SearchConfig
): string {
  return `
SEARCH QUERY: "${config.originalQuery}"

DIETARY PRIORITIES:
${config.proteinPriority ? '✓ HIGH PROTEIN (>25g per serving)' : '○ Normal protein'}
${config.fiberPriority ? '✓ HIGH FIBER (>8g per serving)' : '○ Normal fiber'}

TARGET SERVINGS: ${config.servings} person(s)

PREFERRED CHEFS (prioritize if available):
1. Emily English - Nutrition-focused
2. Gordon Ramsay - Professional techniques
3. Jamie Oliver - Healthy home cooking
4. Yotam Ottolenghi - Vegetable-forward
5. Notorious Foodie - Modern creative

CANDIDATE RECIPES (${candidates.length} total):
${candidates.map((c, i) => `
--- Recipe ${i + 1} ---
Source: ${c.platform} - ${c.author}
Raw Content: ${c.rawContent.slice(0, 1000)}...
`).join('\n')}

TASK:
1. Analyze each recipe for quality and nutritional alignment
2. Rank recipes based on evaluation criteria
3. Select the SINGLE BEST recipe
4. Extract and standardize the recipe in JSON format
5. Scale ingredients to ${config.servings} serving(s)
6. Remove all extraneous content

Return ONLY the JSON object, no additional text.`;
}
```

### 5.3 Prompt Optimization Techniques

**1. Few-Shot Examples**
```typescript
const systemPrompt = `You are a recipe parser. Extract structured recipe data.

EXAMPLE INPUT:
"Gordon Ramsay's Protein Power Bowl
Serves 2
- 300g chicken breast
- 1 cup quinoa
1. Cook quinoa
2. Grill chicken"

EXAMPLE OUTPUT:
{
  "name": "Gordon Ramsay's Protein Power Bowl",
  "servings": 2,
  "ingredients": [
    {"quantity": "300g", "name": "chicken breast"},
    {"quantity": "1 cup", "name": "quinoa"}
  ],
  "instructions": ["Cook quinoa", "Grill chicken"]
}`;
```

**2. Chain-of-Thought Prompting**
```typescript
const userPrompt = `
Let's analyze this recipe step by step:

1. First, evaluate nutritional content:
   - Does it meet the protein requirement (>25g)?
   - Does it meet the fiber requirement (>8g)?

2. Next, check completeness:
   - Are all ingredients listed?
   - Are instructions clear and complete?

3. Then, assess quality:
   - Is the source credible?
   - Are instructions detailed enough?

4. Finally, format the recipe in JSON.

Recipe to analyze:
${recipeContent}`;
```

**3. Constrained Output**
```typescript
const systemPrompt = `Return your response as valid JSON only.
Do not include any text before or after the JSON object.
Do not use markdown code blocks.
Ensure all strings are properly escaped.`;
```

## 6. Error Handling & Retries

### 6.1 Common API Errors

```typescript
enum ClaudeErrorType {
  RateLimitError = 'rate_limit_error',
  InvalidRequestError = 'invalid_request_error',
  AuthenticationError = 'authentication_error',
  APIError = 'api_error',
  OverloadedError = 'overloaded_error',
}

class ClaudeAPIError extends Error {
  constructor(
    public type: ClaudeErrorType,
    public message: string,
    public statusCode?: number
  ) {
    super(message);
  }
}
```

### 6.2 Retry Logic with Exponential Backoff

```typescript
async function sendMessageWithRetry(
  userMessage: string,
  systemPrompt: string,
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await client.messages.create({
        model: ClaudeModel.SONNET,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      });

      return response.content[0].text;

    } catch (error: any) {
      lastError = error;

      // Don't retry on authentication or invalid request errors
      if (
        error.type === ClaudeErrorType.AuthenticationError ||
        error.type === ClaudeErrorType.InvalidRequestError
      ) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delayMs = Math.pow(2, attempt) * 1000;
      console.log(`Retry attempt ${attempt + 1} after ${delayMs}ms`);
      await sleep(delayMs);
    }
  }

  throw new Error(`Failed after ${maxRetries} retries: ${lastError.message}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### 6.3 Rate Limiting

```typescript
import { RateLimiter } from 'limiter';

// Anthropic rate limits (tier 1): 50 requests/minute
const rateLimiter = new RateLimiter({
  tokensPerInterval: 40, // Leave some buffer
  interval: 'minute',
});

async function sendMessageRateLimited(
  userMessage: string,
  systemPrompt: string
): Promise<string> {
  await rateLimiter.removeTokens(1);
  return sendMessageWithRetry(userMessage, systemPrompt);
}
```

## 7. Cost Optimization Strategies

### 7.1 Token Usage Monitoring

```typescript
interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
}

class UsageTracker {
  private totalInputTokens = 0;
  private totalOutputTokens = 0;

  track(response: Anthropic.Message): TokenUsage {
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;

    this.totalInputTokens += inputTokens;
    this.totalOutputTokens += outputTokens;

    // Claude 3.5 Sonnet pricing
    const inputCost = (inputTokens / 1_000_000) * 3;
    const outputCost = (outputTokens / 1_000_000) * 15;
    const totalCost = inputCost + outputCost;

    console.log(`API Call: ${inputTokens} in, ${outputTokens} out, $${totalCost.toFixed(4)}`);

    return { inputTokens, outputTokens, totalCost };
  }

  getTotalCost(): number {
    const inputCost = (this.totalInputTokens / 1_000_000) * 3;
    const outputCost = (this.totalOutputTokens / 1_000_000) * 15;
    return inputCost + outputCost;
  }
}

const usageTracker = new UsageTracker();
```

### 7.2 Prompt Optimization for Cost

**Minimize Input Tokens:**
```typescript
// Bad: Include full HTML content
const prompt = `Analyze this recipe:\n${fullHTMLContent}`;

// Good: Extract relevant content first
const cleanContent = extractRecipeContent(fullHTMLContent);
const prompt = `Analyze this recipe:\n${cleanContent}`;
```

**Minimize Output Tokens:**
```typescript
// Bad: Allow verbose responses
const systemPrompt = `Analyze this recipe and explain your reasoning in detail.`;

// Good: Constrain output format
const systemPrompt = `Analyze this recipe. Return only JSON, no explanation.`;
```

### 7.3 Caching Strategy

```typescript
interface CachedResponse {
  prompt: string;
  response: string;
  timestamp: number;
}

class PromptCache {
  private cache = new Map<string, CachedResponse>();
  private readonly TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

  private hash(prompt: string): string {
    return crypto.createHash('sha256').update(prompt).digest('hex');
  }

  get(prompt: string): string | null {
    const key = this.hash(prompt);
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    console.log('Cache hit! Saved API call.');
    return cached.response;
  }

  set(prompt: string, response: string): void {
    const key = this.hash(prompt);
    this.cache.set(key, {
      prompt,
      response,
      timestamp: Date.now(),
    });
  }
}

const promptCache = new PromptCache();

async function sendMessageCached(
  userMessage: string,
  systemPrompt: string
): Promise<string> {
  const fullPrompt = systemPrompt + '\n' + userMessage;

  // Check cache first
  const cached = promptCache.get(fullPrompt);
  if (cached) return cached;

  // Make API call
  const response = await sendMessageRateLimited(userMessage, systemPrompt);

  // Cache response
  promptCache.set(fullPrompt, response);

  return response;
}
```

## 8. Testing Claude Integration

### 8.1 Mock Client for Testing

```typescript
// backend/src/services/__mocks__/claudeService.ts
export class MockClaudeClient {
  async messages.create(params: any): Promise<any> {
    return {
      content: [
        {
          text: JSON.stringify({
            name: "Mock Recipe",
            servings: 2,
            ingredients: [
              { quantity: "1 cup", name: "test ingredient" }
            ],
            instructions: ["Step 1: Mock instruction"],
          }),
        },
      ],
      usage: {
        input_tokens: 100,
        output_tokens: 200,
      },
    };
  }
}
```

### 8.2 Integration Tests

```typescript
// backend/src/services/__tests__/claudeService.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { searchRecipes } from '../claudeService';

describe('Claude Recipe Search', () => {
  it('should return a valid recipe for protein query', async () => {
    const recipe = await searchRecipes('high protein pasta', {
      proteinPriority: true,
      fiberPriority: false,
      servings: 2,
    });

    expect(recipe.name).toBeDefined();
    expect(recipe.servings).toBe(2);
    expect(recipe.ingredients.length).toBeGreaterThan(0);
    expect(recipe.instructions.length).toBeGreaterThan(0);

    // Verify protein content if available
    if (recipe.nutrition) {
      expect(recipe.nutrition.protein).toBeGreaterThan(20);
    }
  });

  it('should handle API errors gracefully', async () => {
    // Simulate API error
    const mockError = new Error('API Error');
    jest.spyOn(client.messages, 'create').mockRejectedValue(mockError);

    await expect(
      searchRecipes('test query', defaultConfig)
    ).rejects.toThrow('Failed to search recipes');
  });
});
```

## 9. Monitoring & Observability

### 9.1 Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'claude-api.log' }),
    new winston.transports.Console(),
  ],
});

async function loggedAPICall(
  operation: string,
  params: any
): Promise<any> {
  const startTime = Date.now();

  logger.info('Claude API call started', {
    operation,
    model: params.model,
    timestamp: new Date().toISOString(),
  });

  try {
    const response = await client.messages.create(params);
    const duration = Date.now() - startTime;

    logger.info('Claude API call succeeded', {
      operation,
      duration,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    });

    return response;

  } catch (error: any) {
    const duration = Date.now() - startTime;

    logger.error('Claude API call failed', {
      operation,
      duration,
      error: error.message,
      type: error.type,
    });

    throw error;
  }
}
```

### 9.2 Cost Alerts

```typescript
class CostMonitor {
  private dailyCost = 0;
  private readonly DAILY_BUDGET = 1.00; // $1 per day

  trackCost(cost: number): void {
    this.dailyCost += cost;

    if (this.dailyCost > this.DAILY_BUDGET) {
      this.sendAlert(`Daily budget exceeded: $${this.dailyCost.toFixed(2)}`);
    }
  }

  private sendAlert(message: string): void {
    logger.warn('COST ALERT', { message, cost: this.dailyCost });
    // Could also send email, Slack notification, etc.
  }

  resetDaily(): void {
    this.dailyCost = 0;
  }
}

// Reset daily at midnight
setInterval(() => {
  costMonitor.resetDaily();
}, 24 * 60 * 60 * 1000);
```

## 10. Best Practices Summary

### 10.1 Do's
✓ Use Claude 3.5 Sonnet for complex analysis tasks
✓ Use Claude 3 Haiku for simple, fast responses
✓ Implement retry logic with exponential backoff
✓ Cache responses aggressively (7-day TTL)
✓ Log all API calls with token usage
✓ Set up cost monitoring and alerts
✓ Validate API responses before using
✓ Use structured output formats (JSON)
✓ Minimize prompt length by preprocessing content
✓ Test with mock clients in development

### 10.2 Don'ts
✗ Don't commit API keys to version control
✗ Don't send raw HTML to Claude (preprocess first)
✗ Don't use Opus for simple tasks (too expensive)
✗ Don't retry authentication errors
✗ Don't exceed rate limits (use rate limiter)
✗ Don't ignore token usage (monitor costs)
✗ Don't use ambiguous prompts (be specific)
✗ Don't forget to handle streaming responses
✗ Don't skip error handling
✗ Don't use Claude for tasks regex can handle

## 11. Quick Reference

### 11.1 Model Selection Cheat Sheet
- **Recipe search strategy**: Sonnet
- **Recipe analysis & ranking**: Sonnet
- **Content extraction**: Sonnet
- **Chat responses**: Haiku
- **Ingredient scaling**: Haiku
- **Simple questions**: Haiku

### 11.2 Cost Calculator
```
Sonnet: $3/1M input, $15/1M output
Haiku: $0.25/1M input, $1.25/1M output

Typical recipe search:
- 8k input + 2k output = $0.054 (Sonnet)

Typical chat message:
- 500 input + 300 output = $0.0005 (Haiku)

Expected monthly cost (10 searches/day + 20 chats/day):
- Searches: $0.54/day = $16.20/month
- Chats: $0.01/day = $0.30/month
- Total: ~$16.50/month
```

### 11.3 Useful Links
- API Documentation: https://docs.anthropic.com/claude/reference/
- Console (API keys): https://console.anthropic.com/
- Rate limits: https://docs.anthropic.com/claude/reference/rate-limits
- Model comparison: https://docs.anthropic.com/claude/docs/models-overview
- Pricing: https://www.anthropic.com/api
