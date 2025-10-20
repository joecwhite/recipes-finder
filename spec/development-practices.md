# Development Best Practices

## 1. Overview

This document establishes coding standards, development workflows, and quality practices for the Recipe Finder project. Following these practices ensures maintainable, reliable, and high-quality code.

## 2. Code Quality Standards

### 2.1 TypeScript Configuration

**tsconfig.json (Strict Mode)**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
```

**Key Requirements:**
- Enable `strict` mode for type safety
- No `any` types without explicit justification
- Handle all null/undefined cases explicitly
- No unused variables or parameters

### 2.2 ESLint Configuration

**.eslintrc.json**
```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "plugins": ["@typescript-eslint", "import"],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-floating-promises": "error",
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "alphabetize": { "order": "asc" }
    }],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "eqeqeq": ["error", "always"],
    "curly": ["error", "all"]
  }
}
```

**Enforcement:**
```bash
# Run linter
npm run lint

# Auto-fix issues
npm run lint:fix

# Run in CI/CD (fail on warnings)
npm run lint -- --max-warnings 0
```

### 2.3 Prettier Configuration

**.prettierrc**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**VS Code Integration:**
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  }
}
```

## 3. Testing Strategy

### 3.1 Testing Pyramid

```
        ┌─────────────────┐
        │   E2E Tests     │  (10% - Slow, comprehensive)
        │   Playwright    │
        └─────────────────┘
       ┌───────────────────┐
       │ Integration Tests │  (30% - Medium speed)
       │    Vitest         │
       └───────────────────┘
    ┌──────────────────────┐
    │    Unit Tests        │  (60% - Fast, focused)
    │      Vitest          │
    └──────────────────────┘
```

### 3.2 Unit Testing

**Test File Organization:**
```
src/
├── services/
│   ├── claudeService.ts
│   └── claudeService.test.ts      # Co-located tests
├── utils/
│   ├── servingScaler.ts
│   └── servingScaler.test.ts
└── __tests__/                      # Shared test utilities
    ├── fixtures/
    │   └── mockRecipes.ts
    └── helpers/
        └── testUtils.ts
```

**Unit Test Example:**
```typescript
// src/utils/servingScaler.test.ts
import { describe, it, expect } from 'vitest';
import { scaleIngredient, scaleRecipe } from './servingScaler';

describe('servingScaler', () => {
  describe('scaleIngredient', () => {
    it('should scale simple quantities correctly', () => {
      const ingredient = { quantity: '2 cups', name: 'flour' };
      const scaled = scaleIngredient(ingredient, 2, 4);

      expect(scaled.quantity).toBe('4 cups');
    });

    it('should handle fractional quantities', () => {
      const ingredient = { quantity: '1/2 cup', name: 'sugar' };
      const scaled = scaleIngredient(ingredient, 4, 2);

      expect(scaled.quantity).toBe('1/4 cup');
    });

    it('should preserve "to taste" quantities', () => {
      const ingredient = { quantity: 'to taste', name: 'salt' };
      const scaled = scaleIngredient(ingredient, 2, 6);

      expect(scaled.quantity).toBe('to taste');
    });
  });

  describe('scaleRecipe', () => {
    it('should scale all ingredients in recipe', () => {
      const recipe = {
        name: 'Test Recipe',
        servings: 2,
        ingredients: [
          { quantity: '1 cup', name: 'rice' },
          { quantity: '2 cups', name: 'water' },
        ],
        instructions: ['Cook rice'],
      };

      const scaled = scaleRecipe(recipe, 4);

      expect(scaled.servings).toBe(4);
      expect(scaled.ingredients[0].quantity).toBe('2 cups');
      expect(scaled.ingredients[1].quantity).toBe('4 cups');
    });
  });
});
```

**Coverage Requirements:**
- Minimum 80% code coverage
- 100% coverage for critical paths (recipe parsing, Claude API)
- All edge cases tested

```bash
# Run tests with coverage
npm test -- --coverage

# Coverage thresholds in vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
    },
  },
});
```

### 3.3 Integration Testing

**Integration Test Example:**
```typescript
// src/services/__tests__/recipeSearch.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { searchRecipes } from '../searchService';
import { startMockServer } from '../../__tests__/helpers/mockServer';

describe('Recipe Search Integration', () => {
  let mockServer: any;

  beforeAll(async () => {
    mockServer = await startMockServer();
  });

  afterAll(async () => {
    await mockServer.close();
  });

  it('should perform complete recipe search flow', async () => {
    const config = {
      proteinPriority: true,
      fiberPriority: false,
      servings: 2,
      originalQuery: 'chicken breast recipe',
    };

    const recipe = await searchRecipes('chicken breast recipe', config);

    // Verify complete recipe structure
    expect(recipe).toHaveProperty('name');
    expect(recipe).toHaveProperty('servings', 2);
    expect(recipe.ingredients.length).toBeGreaterThan(0);
    expect(recipe.instructions.length).toBeGreaterThan(0);

    // Verify nutritional priorities applied
    if (recipe.nutrition) {
      expect(recipe.nutrition.protein).toBeGreaterThan(20);
    }
  });

  it('should handle scraping failures gracefully', async () => {
    // Simulate scraper failure
    mockServer.simulateError('instagram');

    const recipe = await searchRecipes('test query', defaultConfig);

    // Should fallback to other sources
    expect(recipe).toBeDefined();
    expect(recipe.source.platform).not.toBe('Instagram');
  });
});
```

### 3.4 E2E Testing

**E2E Test Example:**
```typescript
// e2e/recipe-search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Recipe Search Flow', () => {
  test('user can search for recipe and view results', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Configure search preferences
    await page.click('[data-testid="protein-toggle"]');
    await page.selectOption('[data-testid="servings-select"]', '2');

    // Enter search query
    await page.fill('[data-testid="chat-input"]', 'high protein pasta');
    await page.click('[data-testid="send-button"]');

    // Wait for recipe to load
    await page.waitForSelector('[data-testid="recipe-card"]', { timeout: 15000 });

    // Verify recipe displayed
    const recipeName = await page.textContent('[data-testid="recipe-name"]');
    expect(recipeName).toBeTruthy();

    const servings = await page.textContent('[data-testid="recipe-servings"]');
    expect(servings).toContain('2');

    // Verify ingredients list
    const ingredients = await page.locator('[data-testid="ingredient-item"]');
    expect(await ingredients.count()).toBeGreaterThan(0);

    // Verify instructions
    const instructions = await page.locator('[data-testid="instruction-step"]');
    expect(await instructions.count()).toBeGreaterThan(0);
  });

  test('user can refine search through chat', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Initial search
    await page.fill('[data-testid="chat-input"]', 'pasta recipe');
    await page.click('[data-testid="send-button"]');
    await page.waitForSelector('[data-testid="recipe-card"]');

    // Refine search
    await page.fill('[data-testid="chat-input"]', 'make it vegetarian');
    await page.click('[data-testid="send-button"]');
    await page.waitForSelector('[data-testid="recipe-card"]');

    // Verify vegetarian recipe
    const ingredients = await page.locator('[data-testid="ingredient-item"]').allTextContents();
    const hasMeat = ingredients.some(ing =>
      ing.toLowerCase().includes('chicken') ||
      ing.toLowerCase().includes('beef')
    );
    expect(hasMeat).toBe(false);
  });
});
```

### 3.5 Test Data Management

**Mock Data Fixtures:**
```typescript
// src/__tests__/fixtures/mockRecipes.ts
export const mockRecipes = {
  highProteinPasta: {
    name: "High Protein Chicken Pasta",
    servings: 2,
    ingredients: [
      { quantity: "300g", name: "chicken breast", notes: "diced" },
      { quantity: "200g", name: "whole wheat pasta" },
      { quantity: "1 cup", name: "cherry tomatoes", notes: "halved" },
    ],
    instructions: [
      "Cook pasta according to package instructions",
      "Season and cook chicken until golden",
      "Combine pasta, chicken, and tomatoes",
    ],
    nutrition: {
      protein: 42,
      fiber: 8,
      calories: 520,
    },
    source: {
      platform: "Instagram",
      author: "Emily English",
      url: "https://instagram.com/p/example",
    },
  },

  vegetarianBowl: {
    // ... another mock recipe
  },
};

export const mockSearchConfigs = {
  highProtein: {
    proteinPriority: true,
    fiberPriority: false,
    servings: 2,
    originalQuery: "high protein recipe",
  },

  highFiber: {
    proteinPriority: false,
    fiberPriority: true,
    servings: 4,
    originalQuery: "high fiber meal",
  },
};
```

## 4. Git Workflow & Version Control

### 4.1 Branch Strategy

**Main Branches:**
- `main` - Production-ready code (always deployable)
- `develop` - Integration branch for features

**Feature Branches:**
- Naming: `feature/short-description` (e.g., `feature/instagram-scraper`)
- Naming: `bugfix/issue-description` (e.g., `bugfix/serving-scaler-fractions`)
- Naming: `refactor/component-name` (e.g., `refactor/claude-service`)

**Workflow:**
```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/youtube-scraper

# Make changes and commit regularly
git add .
git commit -m "feat: implement YouTube recipe scraper"

# Push to remote
git push origin feature/youtube-scraper

# Create PR to merge into develop
# After review and approval, merge via GitHub/GitLab

# Delete feature branch after merge
git branch -d feature/youtube-scraper
```

### 4.2 Commit Message Standards

**Format: Conventional Commits**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring (no functionality change)
- `test`: Adding or updating tests
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `perf`: Performance improvements
- `chore`: Maintenance tasks (dependencies, build config)
- `ci`: CI/CD changes

**Examples:**
```bash
# Good commits
git commit -m "feat(scraper): add Instagram recipe extraction"

git commit -m "fix(parser): handle fractional ingredient quantities correctly

- Support 1/2, 1/4, 3/4 fractions
- Handle mixed numbers (1 1/2)
- Add tests for edge cases"

git commit -m "refactor(claude): extract prompt building into separate module"

git commit -m "test(serving-scaler): add tests for edge cases"

git commit -m "docs(readme): add setup instructions for local development"

# Bad commits (avoid)
git commit -m "update code"
git commit -m "fixes"
git commit -m "WIP"
git commit -m "asdf"
```

**Commit Message Guidelines:**
- Use imperative mood ("add feature" not "added feature")
- First line under 72 characters
- Capitalize first letter of subject
- No period at end of subject
- Body explains "what" and "why", not "how"
- Reference issues: "Closes #123"

### 4.3 Code Review Process

**Pull Request Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Refactoring
- [ ] Documentation

## Changes Made
- Bullet point list of changes
- Include important details

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] All tests passing

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No hardcoded values
```

**Review Checklist:**
1. **Functionality**
   - Does code do what it's supposed to?
   - Are edge cases handled?
   - Any security vulnerabilities?

2. **Code Quality**
   - Follows TypeScript/ESLint standards?
   - No code duplication?
   - Functions are single-purpose?
   - Clear variable/function names?

3. **Testing**
   - Adequate test coverage?
   - Tests are meaningful (not just for coverage)?
   - Edge cases tested?

4. **Documentation**
   - Complex logic explained with comments?
   - README updated if needed?
   - Type definitions clear?

5. **Performance**
   - No obvious performance issues?
   - Async operations handled correctly?
   - No unnecessary API calls?

**Review Response Times:**
- Small PRs (< 100 lines): 24 hours
- Medium PRs (100-500 lines): 48 hours
- Large PRs (> 500 lines): Consider splitting

## 5. Code Organization Patterns

### 5.1 File Structure Standards

**Consistent Naming:**
```
✓ claudeService.ts         (camelCase for files)
✓ RecipeCard.tsx           (PascalCase for React components)
✓ useRecipeSearch.ts       (camelCase for hooks)
✓ Recipe.ts                (PascalCase for types/interfaces)
✗ ClaudeService.ts         (inconsistent)
✗ recipe-card.tsx          (inconsistent)
```

**Module Organization:**
```typescript
// Good: Logical grouping and ordering
// 1. Type imports
import type { Recipe, SearchConfig } from '../types';

// 2. External dependencies
import { Anthropic } from '@anthropic-ai/sdk';
import axios from 'axios';

// 3. Internal dependencies
import { config } from '../config/env';
import { logger } from '../utils/logger';

// 4. Types and interfaces
interface SearchStrategy {
  keywords: string[];
  sources: Source[];
}

// 5. Constants
const DEFAULT_TIMEOUT = 10000;
const MAX_RETRIES = 3;

// 6. Helper functions
function buildPrompt(query: string): string {
  // ...
}

// 7. Main exported functions
export async function searchRecipes(
  query: string,
  config: SearchConfig
): Promise<Recipe> {
  // ...
}
```

### 5.2 Function Design Principles

**Single Responsibility:**
```typescript
// Bad: Function does too much
async function getRecipe(query: string): Promise<Recipe> {
  const strategy = await generateSearchStrategy(query);
  const scraped = await scrapeAllSources(strategy);
  const analyzed = await analyzeRecipes(scraped);
  const formatted = await formatRecipe(analyzed);
  const scaled = await scaleRecipe(formatted, 2);
  await cacheRecipe(scaled);
  await logMetrics(scaled);
  return scaled;
}

// Good: Break into focused functions
export async function searchRecipe(
  query: string,
  config: SearchConfig
): Promise<Recipe> {
  const strategy = await generateSearchStrategy(query, config);
  const candidates = await scrapeRecipeCandidates(strategy);
  const bestRecipe = await selectBestRecipe(candidates, config);
  const scaledRecipe = scaleRecipeServings(bestRecipe, config.servings);

  await cacheRecipe(scaledRecipe);

  return scaledRecipe;
}
```

**Function Length:**
- Prefer functions < 50 lines
- If > 50 lines, consider extracting sub-functions
- Each function does ONE thing well

**Clear Function Signatures:**
```typescript
// Bad: Unclear parameters
function process(data: any, opts: any): any {
  // ...
}

// Good: Explicit types and clear intent
function parseRecipeFromHTML(
  htmlContent: string,
  options: ParseOptions
): Recipe | null {
  // ...
}

interface ParseOptions {
  strictMode: boolean;
  includeNutrition: boolean;
}
```

### 5.3 Error Handling Patterns

**Consistent Error Handling:**
```typescript
// Define custom error types
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

// Use specific error types
async function scrapeInstagram(query: string): Promise<Recipe[]> {
  try {
    const response = await axios.get(instagramUrl);
    return parseRecipes(response.data);
  } catch (error) {
    throw new ScraperError('Instagram', error as Error);
  }
}

// Handle errors at appropriate level
export async function searchRecipes(
  query: string,
  config: SearchConfig
): Promise<Recipe> {
  try {
    const recipe = await performSearch(query, config);
    return recipe;
  } catch (error) {
    if (error instanceof RecipeNotFoundError) {
      logger.warn('No recipes found', { query });
      throw error; // Let caller handle
    } else if (error instanceof ScraperError) {
      logger.error('Scraping failed', { error, query });
      // Try fallback sources
      return await fallbackSearch(query, config);
    } else {
      logger.error('Unexpected error', { error, query });
      throw new Error('Failed to search recipes. Please try again.');
    }
  }
}
```

### 5.4 TypeScript Best Practices

**Prefer Interfaces Over Types for Objects:**
```typescript
// Good: Use interfaces for object shapes
interface Recipe {
  name: string;
  servings: number;
  ingredients: Ingredient[];
}

// Use type for unions, primitives, functions
type Platform = 'Instagram' | 'TikTok' | 'YouTube' | 'Web';
type SearchFunction = (query: string) => Promise<Recipe[]>;
```

**Avoid Type Assertions:**
```typescript
// Bad: Type assertions hide potential errors
const recipe = data as Recipe;

// Good: Validate and narrow types
function isValidRecipe(data: unknown): data is Recipe {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    'servings' in data &&
    'ingredients' in data
  );
}

if (isValidRecipe(data)) {
  const recipe = data; // Type is narrowed to Recipe
  processRecipe(recipe);
}
```

**Use Discriminated Unions:**
```typescript
// Good: Type-safe state handling
type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; recipe: Recipe }
  | { status: 'error'; error: string };

function renderSearchState(state: SearchState): React.ReactNode {
  switch (state.status) {
    case 'idle':
      return <SearchPrompt />;
    case 'loading':
      return <LoadingSpinner />;
    case 'success':
      return <RecipeCard recipe={state.recipe} />;
    case 'error':
      return <ErrorMessage message={state.error} />;
  }
}
```

## 6. Documentation Standards

### 6.1 Code Comments

**When to Comment:**
✓ Complex algorithms or business logic
✓ Non-obvious solutions to problems
✓ "Why" decisions, not "what" the code does
✓ TODO/FIXME for future work

✗ Obvious code that explains itself
✗ Redundant comments
✗ Commented-out code (use git history)

**Good Comments:**
```typescript
// Good: Explains why, not what
// Instagram's API rate limit is 200 requests/hour per IP.
// We limit to 150 to leave buffer for other requests.
const INSTAGRAM_RATE_LIMIT = 150;

// Good: Explains complex logic
// Convert mixed fractions (e.g., "1 1/2") to improper fractions
// before scaling to avoid rounding errors
function parseQuantity(quantity: string): number {
  const mixedMatch = quantity.match(/(\d+)\s+(\d+)\/(\d+)/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1]);
    const numerator = parseInt(mixedMatch[2]);
    const denominator = parseInt(mixedMatch[3]);
    return whole + numerator / denominator;
  }
  // ... handle other cases
}

// Bad: States the obvious
// Increment counter by 1
counter++;

// Bad: Redundant
// Get recipe by ID
function getRecipeById(id: string): Recipe {
  // ...
}
```

### 6.2 JSDoc for Public APIs

```typescript
/**
 * Searches for recipes across multiple sources based on user query and preferences.
 *
 * @param query - Natural language recipe search query (e.g., "high protein pasta")
 * @param config - Search configuration including dietary priorities and servings
 * @returns Promise resolving to the best matching recipe
 * @throws {RecipeNotFoundError} When no suitable recipes are found
 * @throws {ScraperError} When all recipe sources fail
 *
 * @example
 * ```typescript
 * const recipe = await searchRecipes('high protein pasta', {
 *   proteinPriority: true,
 *   fiberPriority: false,
 *   servings: 2,
 * });
 * console.log(recipe.name); // "High Protein Chicken Pasta"
 * ```
 */
export async function searchRecipes(
  query: string,
  config: SearchConfig
): Promise<Recipe> {
  // ...
}
```

### 6.3 README Structure

**Component README Template:**
```markdown
# Component Name

Brief description of what this component does.

## Usage

\`\`\`typescript
import { ComponentName } from './ComponentName';

<ComponentName prop1="value" prop2={123} />
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| prop1 | string | - | Description of prop1 |
| prop2 | number | 0 | Description of prop2 |

## Examples

### Basic Usage
\`\`\`typescript
// Example code
\`\`\`

### Advanced Usage
\`\`\`typescript
// More complex example
\`\`\`

## Implementation Notes

Any important details about how this component works internally.

## Testing

How to run tests for this component.
```

## 7. Performance Best Practices

### 7.1 Async/Await Patterns

**Parallel Execution:**
```typescript
// Bad: Sequential execution (slow)
const instagramRecipes = await scrapeInstagram(query);
const tiktokRecipes = await scrapeTikTok(query);
const youtubeRecipes = await scrapeYouTube(query);

// Good: Parallel execution (fast)
const [instagramRecipes, tiktokRecipes, youtubeRecipes] = await Promise.all([
  scrapeInstagram(query),
  scrapeTikTok(query),
  scrapeYouTube(query),
]);

// Even better: Handle individual failures
const results = await Promise.allSettled([
  scrapeInstagram(query),
  scrapeTikTok(query),
  scrapeYouTube(query),
]);

const allRecipes = results
  .filter((r) => r.status === 'fulfilled')
  .flatMap((r) => r.value);
```

**Avoid Unnecessary Awaits:**
```typescript
// Bad: Unnecessary await in return
async function getRecipe(id: string): Promise<Recipe> {
  const recipe = await fetchRecipe(id);
  return recipe;
}

// Good: Return promise directly
function getRecipe(id: string): Promise<Recipe> {
  return fetchRecipe(id);
}

// Or if you need to do work:
async function getRecipe(id: string): Promise<Recipe> {
  const recipe = await fetchRecipe(id);
  logger.info('Fetched recipe', { id });
  return recipe;
}
```

### 7.2 Caching Strategies

```typescript
// Implement memoization for expensive operations
import memoize from 'lodash.memoize';

const expensiveOperation = memoize(
  (input: string): number => {
    // ... expensive calculation
    return result;
  },
  (input: string) => input // Key function
);
```

### 7.3 Database Query Optimization

```typescript
// Use indexes for frequently queried fields
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_recipes_query_hash
  ON recipes(query_hash)
`);

// Use prepared statements for repeated queries
const getRecipeStmt = db.prepare(`
  SELECT * FROM recipes WHERE query_hash = ?
`);

function getCachedRecipe(queryHash: string): Recipe | null {
  return getRecipeStmt.get(queryHash);
}
```

## 8. Security Best Practices

### 8.1 Environment Variables

```typescript
// Never commit secrets
// Always use environment variables
// Validate on startup

import dotenv from 'dotenv';
dotenv.config();

interface Config {
  anthropicApiKey: string;
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
}

function loadConfig(): Config {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is required');
  }

  if (!apiKey.startsWith('sk-ant-')) {
    throw new Error('Invalid ANTHROPIC_API_KEY format');
  }

  return {
    anthropicApiKey: apiKey,
    nodeEnv: (process.env.NODE_ENV as Config['nodeEnv']) || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
  };
}

export const config = loadConfig();
```

### 8.2 Input Validation

```typescript
import validator from 'validator';

function validateSearchQuery(query: string): void {
  if (!query || query.trim().length === 0) {
    throw new Error('Query cannot be empty');
  }

  if (query.length > 500) {
    throw new Error('Query too long (max 500 characters)');
  }

  // Sanitize for XSS (if displaying user input)
  const sanitized = validator.escape(query);
}

function validateSearchConfig(config: SearchConfig): void {
  if (config.servings < 1 || config.servings > 8) {
    throw new Error('Servings must be between 1 and 8');
  }

  if (typeof config.proteinPriority !== 'boolean') {
    throw new Error('proteinPriority must be a boolean');
  }
}
```

### 8.3 Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

// Limit recipe searches to prevent abuse
const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: 'Too many recipe searches. Please try again later.',
});

app.post('/api/recipes/search', searchLimiter, async (req, res) => {
  // ... handle search
});
```

## 9. Continuous Integration

### 9.1 GitHub Actions Workflow

**.github/workflows/ci.yml**
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run unit tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

      - name: Run build
        run: npm run build

  e2e:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### 9.2 Pre-commit Hooks

**Setup Husky:**
```bash
npm install -D husky lint-staged

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

**package.json:**
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "vitest related --run"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

## 10. Development Checklist

### 10.1 Before Starting a Task

- [ ] Read requirements thoroughly
- [ ] Check existing code patterns
- [ ] Create feature branch from develop
- [ ] Write failing tests first (TDD approach)

### 10.2 During Development

- [ ] Follow TypeScript strict mode rules
- [ ] Write descriptive commit messages
- [ ] Add comments for complex logic
- [ ] Keep functions small and focused
- [ ] Handle errors appropriately
- [ ] Test edge cases

### 10.3 Before Submitting PR

- [ ] All tests passing locally
- [ ] Linter passes with no warnings
- [ ] Code coverage meets thresholds (80%+)
- [ ] Manual testing completed
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Documentation updated
- [ ] Self-review completed
- [ ] PR description filled out

### 10.4 Code Review Checklist

- [ ] Code follows project conventions
- [ ] Tests are comprehensive
- [ ] No obvious bugs or security issues
- [ ] Performance is acceptable
- [ ] Documentation is clear
- [ ] Commit messages follow standards

## 11. Quick Reference

### 11.1 Common Commands

```bash
# Development
npm run dev          # Start dev servers (frontend + backend)
npm test             # Run unit tests
npm test -- --watch  # Run tests in watch mode
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm run type-check   # Run TypeScript compiler check

# Production
npm run build        # Build for production
npm start            # Start production server

# Testing
npm run test:unit       # Unit tests only
npm run test:integration # Integration tests
npm run test:e2e        # E2E tests with Playwright
npm run test:coverage   # Generate coverage report

# Code Quality
npm run format       # Format with Prettier
npm run format:check # Check formatting
```

### 11.2 Useful VSCode Extensions

- ESLint
- Prettier - Code formatter
- TypeScript Vue Plugin (Volar)
- GitLens
- Error Lens
- Import Cost
- Test Explorer UI
- Playwright Test for VSCode

## 12. Learning Resources

### 12.1 Recommended Reading

- **TypeScript**: [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- **Testing**: [Testing JavaScript](https://testingjavascript.com/)
- **React**: [React Documentation](https://react.dev/)
- **Node.js**: [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### 12.2 Style Guides

- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Remember**: These practices exist to help us write better code. When in doubt, prioritize:
1. **Correctness** - Does it work?
2. **Readability** - Can others understand it?
3. **Maintainability** - Can it be easily changed?
4. **Performance** - Is it fast enough?

Happy coding!
