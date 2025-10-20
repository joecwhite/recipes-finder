# Recipe Finder AI Agent - Technical Design & Architecture

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User's Laptop (Local)                    │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │               Frontend Application                      │ │
│  │  ┌──────────────┐        ┌────────────────────┐       │ │
│  │  │   Chat UI    │        │  Search Config UI  │       │ │
│  │  │              │        │  (Protein/Fiber/   │       │ │
│  │  │              │        │   Servings)        │       │ │
│  │  └──────┬───────┘        └────────┬───────────┘       │ │
│  │         │                         │                    │ │
│  │         └─────────────┬───────────┘                    │ │
│  │                       │                                │ │
│  └───────────────────────┼────────────────────────────────┘ │
│                          │                                  │
│  ┌───────────────────────▼────────────────────────────────┐ │
│  │               Backend Application                      │ │
│  │                                                         │ │
│  │  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐ │ │
│  │  │   Request    │  │   Claude    │  │   Recipe     │ │ │
│  │  │   Handler    │→ │ Integration │→ │   Parser     │ │ │
│  │  └──────────────┘  └─────────────┘  └──────────────┘ │ │
│  │                                                         │ │
│  │  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐ │ │
│  │  │   Web        │  │   Content   │  │   Cache      │ │ │
│  │  │   Scraper    │  │   Filter    │  │   Manager    │ │ │
│  │  └──────────────┘  └─────────────┘  └──────────────┘ │ │
│  └─────────────────────────────────────────────────────── │ │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                   ┌────────▼─────────┐
                   │   Internet       │
                   │  Claude API      │
                   │  Recipe Sources  │
                   └──────────────────┘
```

## 2. Technology Stack

### 2.1 Frontend
- **Framework**: React with TypeScript
  - Modern, maintainable, component-based architecture
  - Strong typing for reliability
  - Rich ecosystem of UI libraries

- **UI Framework**: Tailwind CSS + shadcn/ui
  - Clean, modern design system
  - Pre-built chat components
  - Customizable and accessible

- **State Management**: React Context API + React Query
  - Simple state management for UI preferences
  - React Query for API caching and data fetching
  - No need for Redux complexity

### 2.2 Backend
- **Runtime**: Node.js with TypeScript
  - JavaScript ecosystem compatibility with frontend
  - Excellent async I/O for web scraping
  - Strong typing for maintainability

- **Framework**: Express.js
  - Lightweight and flexible
  - Well-documented and widely used
  - Easy to extend with middleware

- **API Client**: Anthropic Claude SDK
  - Official SDK for Claude API
  - Built-in error handling and retries
  - TypeScript support

### 2.3 Web Scraping & Search
- **Web Scraping**: Puppeteer or Playwright
  - Handle JavaScript-heavy sites (Instagram, TikTok)
  - Screenshot capability for video thumbnails
  - Headless browser automation

- **HTTP Client**: Axios
  - For simpler HTTP requests
  - Interceptors for rate limiting
  - Retry logic built-in

- **Search Strategy**: Multi-source aggregation
  - Custom scrapers per platform (Instagram, TikTok, YouTube)
  - Google Custom Search API (fallback for articles)
  - YouTube Data API v3 for video content

### 2.4 Data & Storage
- **Cache**: SQLite with better-sqlite3
  - Lightweight, file-based database
  - Perfect for local storage
  - Fast recipe caching and search history

- **Configuration**: JSON files + environment variables
  - User preferences stored in local JSON
  - API keys in .env file
  - Easy to version control (except secrets)

### 2.5 Development Tools
- **Build Tool**: Vite
  - Fast development server
  - Optimized production builds
  - Native TypeScript support

- **Testing**: Vitest + React Testing Library + Playwright
  - Vitest for unit/integration tests
  - React Testing Library for component tests
  - Playwright for E2E tests

- **Code Quality**: ESLint + Prettier + TypeScript
  - Consistent code formatting
  - Catch errors before runtime
  - Enforce best practices

## 3. Component Architecture

### 3.1 Frontend Components

```
src/
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx       # Main chat container
│   │   ├── MessageList.tsx         # Display message history
│   │   ├── MessageInput.tsx        # User input field
│   │   └── RecipeCard.tsx          # Formatted recipe display
│   ├── search/
│   │   ├── SearchConfig.tsx        # Configuration panel
│   │   ├── ProteinToggle.tsx       # Protein priority toggle
│   │   ├── FiberToggle.tsx         # Fiber priority toggle
│   │   └── ServingsSelector.tsx    # 1-8 servings selector
│   ├── layout/
│   │   ├── AppLayout.tsx           # Main layout wrapper
│   │   └── Header.tsx              # App header
│   └── ui/
│       └── [shadcn components]     # Reusable UI primitives
├── hooks/
│   ├── useRecipeSearch.ts          # Recipe search logic
│   ├── useSearchConfig.ts          # Search preferences state
│   └── useChat.ts                  # Chat message management
├── lib/
│   ├── api.ts                      # API client functions
│   └── types.ts                    # TypeScript interfaces
└── App.tsx                          # Root component
```

### 3.2 Backend Components

```
src/
├── controllers/
│   ├── recipeController.ts         # Handle recipe search requests
│   └── chatController.ts           # Handle chat interactions
├── services/
│   ├── claudeService.ts            # Claude API integration
│   ├── searchService.ts            # Orchestrate multi-source search
│   ├── scraperService.ts           # Web scraping logic
│   └── cacheService.ts             # Recipe caching
├── scrapers/
│   ├── instagramScraper.ts         # Instagram recipe extraction
│   ├── tiktokScraper.ts            # TikTok recipe extraction
│   ├── youtubeScraper.ts           # YouTube recipe extraction
│   └── webScraper.ts               # Generic web article scraper
├── parsers/
│   ├── recipeParser.ts             # Parse recipes to standard format
│   ├── nutritionParser.ts          # Extract nutritional info
│   └── contentFilter.ts            # Remove extraneous content
├── utils/
│   ├── servingScaler.ts            # Scale ingredients for servings
│   ├── promptBuilder.ts            # Build Claude prompts
│   └── validators.ts               # Input validation
├── models/
│   ├── Recipe.ts                   # Recipe data model
│   └── SearchConfig.ts             # Search configuration model
├── routes/
│   ├── recipeRoutes.ts             # Recipe API endpoints
│   └── chatRoutes.ts               # Chat API endpoints
└── server.ts                        # Express server setup
```

## 4. Data Flow

### 4.1 Recipe Search Flow

```
1. User Input
   ↓
2. Frontend: Capture query + search config
   ↓
3. API Request: POST /api/recipes/search
   {
     query: "high protein pasta",
     config: { protein: true, fiber: false, servings: 2 }
   }
   ↓
4. Backend: searchService.findRecipe()
   ↓
5. Check Cache: Has this query been searched recently?
   ├─ Yes → Return cached result
   └─ No → Continue
   ↓
6. Build Claude Prompt with:
   - User query
   - Search configuration
   - Preferred chefs
   - Source priorities
   ↓
7. Claude API: Generate search strategy
   - Determine best keywords
   - Identify target sources
   ↓
8. Web Search: Scrape multiple sources in parallel
   - Instagram (preferred chefs first)
   - TikTok (trending recipes)
   - YouTube (cooking videos)
   - Web articles (recipe sites)
   ↓
9. Aggregate Results: Collect 10-20 candidate recipes
   ↓
10. Claude API: Analyze and rank recipes
    - Apply nutritional priorities
    - Evaluate completeness
    - Check for user preferences
    - Select BEST recipe
    ↓
11. Parse & Format: recipeParser.standardize()
    - Extract dish name
    - Parse ingredients
    - Format instructions
    - Scale for servings
    - Strip extraneous content
    ↓
12. Cache Result: Store for future requests
    ↓
13. Return to Frontend
    ↓
14. Display: Render RecipeCard with formatted recipe
```

### 4.2 Chat Interaction Flow

```
1. User sends message in chat
   ↓
2. Frontend: Determine intent
   ├─ New recipe search → Recipe search flow
   ├─ Refinement ("make it vegan") → Modify previous search
   └─ Question ("how do I dice onions?") → Claude Q&A
   ↓
3. Maintain conversation context
   - Store last recipe
   - Track search history
   - Remember preferences
   ↓
4. Generate contextual response
   ↓
5. Display in chat interface
```

## 5. Claude Integration Strategy

### 5.1 Claude Model Selection
- **Primary Model**: Claude 3.5 Sonnet
  - Best balance of intelligence and cost
  - Excellent at content analysis and extraction
  - Strong instruction following

- **Fallback Model**: Claude 3 Haiku
  - Use for simple queries or follow-ups
  - Cost-effective for high-volume requests

### 5.2 Claude API Endpoints Used

1. **Messages API** (Primary)
   - Used for all conversational interactions
   - Supports system prompts for recipe search instructions
   - Maintains conversation history

2. **Prompt Structure**

```typescript
{
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 4096,
  system: `You are a recipe search assistant...
           [Detailed instructions about preferences, sources, format]`,
  messages: [
    {
      role: "user",
      content: `Find a high-protein pasta recipe for 2 servings.
                Sources: Instagram (Emily English), YouTube, web articles.
                Prioritize protein content.`
    }
  ]
}
```

### 5.3 Two-Phase Claude Usage

**Phase 1: Search Strategy Generation**
- Input: User query + preferences
- Output: Search keywords, target sources, chef accounts to check
- Purpose: Intelligent search planning

**Phase 2: Recipe Analysis & Selection**
- Input: Scraped recipe candidates
- Output: Single best recipe in standardized format
- Purpose: Quality filtering and formatting

## 6. Web Scraping Strategy

### 6.1 Instagram Scraping
- **Method**: Puppeteer with authenticated session
- **Targets**:
  - Chef profile pages (preferred chefs first)
  - Recipe posts with #recipe hashtags
  - Reels with cooking content
- **Extraction**:
  - Post captions (ingredients, instructions)
  - Image analysis for visual appeal
  - Comments for additional tips

### 6.2 TikTok Scraping
- **Method**: Playwright with API fallback
- **Targets**:
  - Chef profiles
  - #recipe and #cooking hashtags
  - Trending food videos
- **Extraction**:
  - Video descriptions
  - On-screen text (OCR if needed)
  - Comments for recipe details

### 6.3 YouTube Scraping
- **Method**: YouTube Data API v3
- **Targets**:
  - Chef channels
  - Recipe video searches
  - Cooking tutorials
- **Extraction**:
  - Video descriptions (often contain full recipes)
  - Transcripts via YouTube API
  - Comments for clarifications

### 6.4 Web Article Scraping
- **Method**: Axios + Cheerio for parsing
- **Targets**:
  - Recipe blogs (AllRecipes, BBC Good Food, etc.)
  - Food websites
  - Chef personal websites
- **Extraction**:
  - Structured recipe data (Schema.org markup)
  - HTML content parsing
  - Nutritional information tables

### 6.5 Rate Limiting & Politeness
- Implement delays between requests (1-2 seconds)
- Respect robots.txt
- Rotate user agents
- Cache scraped content (1 hour TTL)
- Limit concurrent requests (max 3 per source)

## 7. Recipe Parsing & Formatting

### 7.1 Content Filtering Rules

**Remove:**
- Social media engagement prompts ("Don't forget to like and subscribe!")
- Personal anecdotes ("This reminds me of my grandmother...")
- Ads and sponsorships
- Unrelated commentary
- Popup notifications
- Cookie banners

**Keep:**
- Dish name
- Servings
- Prep/cook time (optional but useful)
- Ingredients with quantities
- Step-by-step instructions
- Nutritional information
- Cooking tips directly related to recipe

### 7.2 Standardization Process

```typescript
interface Recipe {
  name: string;
  servings: number;
  prepTime?: number;        // minutes
  cookTime?: number;        // minutes
  ingredients: Ingredient[];
  instructions: string[];   // Numbered steps
  nutrition?: {
    protein: number;        // grams
    fiber: number;          // grams
    calories: number;
  };
  source: {
    platform: string;       // "Instagram", "YouTube", etc.
    author: string;         // Chef name
    url: string;
  };
}

interface Ingredient {
  quantity: string;         // "2 cups", "500g", "1 tbsp"
  name: string;
  notes?: string;           // "diced", "optional", etc.
}
```

### 7.3 Serving Size Scaling
- Parse ingredient quantities (handle fractions, decimals, units)
- Scale based on user's selected servings
- Round to sensible measurements (e.g., 1.3 cups → 1⅓ cups)
- Handle edge cases (pinch of salt, "to taste")

## 8. Caching Strategy

### 8.1 Cache Structure (SQLite)

```sql
CREATE TABLE recipes (
  id INTEGER PRIMARY KEY,
  query_hash TEXT UNIQUE,      -- Hash of query + config
  query TEXT,
  config JSON,
  recipe JSON,                  -- Full recipe object
  created_at TIMESTAMP,
  accessed_at TIMESTAMP,
  access_count INTEGER
);

CREATE TABLE scraped_content (
  id INTEGER PRIMARY KEY,
  url TEXT UNIQUE,
  platform TEXT,
  content JSON,
  created_at TIMESTAMP,
  expires_at TIMESTAMP
);
```

### 8.2 Cache Invalidation
- Recipe cache: 7 days TTL
- Scraped content cache: 1 hour TTL
- LRU eviction when cache exceeds 1000 entries

## 9. Error Handling

### 9.1 Failure Scenarios

1. **No recipes found**
   - Broaden search criteria
   - Suggest alternative queries
   - Fallback to general recipe search

2. **Claude API failure**
   - Retry with exponential backoff
   - Fallback to cached similar recipes
   - Display helpful error message

3. **Scraping failure**
   - Try alternative sources
   - Use cached content if available
   - Log failures for debugging

4. **Invalid recipe data**
   - Skip and try next candidate
   - Validate completeness before returning
   - Request user feedback if persistent

### 9.2 User-Facing Error Messages
- Be specific but not technical
- Suggest actionable next steps
- Maintain conversational tone
- "I couldn't find recipes on Instagram right now, but I found a great one from BBC Good Food instead!"

## 10. Performance Optimization

### 10.1 Response Time Targets
- Cache hit: < 500ms
- Cache miss (new search): < 10 seconds
- Chat response: < 2 seconds

### 10.2 Optimization Strategies
1. **Parallel scraping**: Search all sources simultaneously
2. **Early termination**: Stop when high-quality recipe found
3. **Smart caching**: Cache partial results (search keywords, candidates)
4. **Lazy loading**: Stream recipe display as data arrives
5. **Preemptive caching**: Cache popular queries

### 10.3 Cost Optimization
- Use Claude 3 Haiku for simple tasks
- Batch analyze multiple recipes in single API call
- Cache aggressively
- Minimize token usage with concise prompts
- Monitor API usage and set budget alerts

## 11. Security Considerations

### 11.1 API Key Management
- Store Claude API key in .env (never commit)
- Use environment variables in production
- Rotate keys periodically
- Set usage limits on Anthropic dashboard

### 11.2 Input Validation
- Sanitize user queries (prevent injection)
- Validate servings range (1-8)
- Rate limit user requests (prevent abuse)
- Validate URLs before scraping

### 11.3 Content Safety
- Filter inappropriate content from scraped recipes
- Validate recipe safety (no dangerous instructions)
- Check for allergen information completeness

## 12. Deployment Architecture

### 12.1 Local Development
```
npm run dev
├── Frontend: localhost:5173 (Vite)
└── Backend: localhost:3000 (Express)
```

### 12.2 Production Build (Local)
```
npm run build
├── Frontend: Build to static files
└── Backend: Bundle with esbuild

npm start
└── Serve from single Express server on localhost:3000
```

### 12.3 Directory Structure
```
recipe-finder/
├── frontend/                 # React app
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # Express server
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── shared/                   # Shared types
│   └── types.ts
├── spec/                     # This documentation
├── .env.example
├── .gitignore
├── package.json              # Root package (monorepo)
└── README.md
```

## 13. Future Scalability

### 13.1 Potential Enhancements
- Add more recipe sources (Pinterest, Reddit)
- Implement meal planning across days
- Build grocery list generator
- Add recipe ratings and favorites
- Support voice input via Web Speech API
- Offline mode with pre-cached recipes

### 13.2 Architecture Flexibility
- Backend API is platform-agnostic (could move to cloud)
- Frontend is deployable to web (Vercel, Netlify)
- Database can upgrade to PostgreSQL if needed
- Microservices pattern possible (separate scraping service)

## 14. Development Milestones

### Phase 1: Core Infrastructure (Week 1-2)
- Set up project structure
- Implement Claude API integration
- Build basic chat interface
- Create recipe data models

### Phase 2: Search & Scraping (Week 3-4)
- Implement web scrapers for each source
- Build recipe parser and content filter
- Integrate Claude for recipe analysis
- Add caching layer

### Phase 3: UI & UX Polish (Week 5)
- Complete search configuration UI
- Polish chat interface
- Add loading states and error handling
- Implement serving size scaling

### Phase 4: Testing & Refinement (Week 6)
- Write comprehensive tests
- Performance optimization
- Bug fixes and edge case handling
- Documentation and README

### Phase 5: Launch (Week 7)
- Final testing on user's laptop
- Deploy local build
- User training and handoff
- Monitor usage and gather feedback
