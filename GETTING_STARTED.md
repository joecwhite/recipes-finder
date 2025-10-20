# Getting Started with Recipe Finder AI

This guide will help you get the Recipe Finder application up and running on your local machine.

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **Claude API Key** from [console.anthropic.com](https://console.anthropic.com/settings/keys)

## Installation Steps

### 1. Install Dependencies

From the project root, run:

```bash
npm install
```

This will install dependencies for both the backend and frontend workspaces.

### 2. Configure Environment

Your `.env` file should already be set up with your Claude API key. If not, create it:

```bash
cp .env.example .env
```

Then edit `.env` and add your API key:

```env
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
NODE_ENV=development
PORT=3000
```

## Running the Application

### Development Mode (Recommended)

Run both backend and frontend simultaneously:

```bash
npm run dev
```

This will start:
- **Backend API** on `http://localhost:3000`
- **Frontend** on `http://localhost:5173`

The frontend will automatically proxy API requests to the backend.

### Separate Terminals (Alternative)

If you prefer separate terminals:

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

## Using the Application

### 1. Open the Frontend

Navigate to `http://localhost:5173` in your browser.

### 2. Configure Search Preferences

On the left sidebar, you can:
- ✓ Toggle **High Protein** (>25g per serving)
- ✓ Toggle **High Fiber** (>8g per serving)
- 📊 Select **Servings** (1-8 persons)

### 3. Search for Recipes

In the chat interface, type queries like:
- "high protein chicken recipe"
- "vegetarian high fiber meal"
- "quick pasta dish"
- "healthy breakfast"

### 4. View Results

The AI will:
1. Generate a search strategy based on your query
2. Search mock recipe sources (MVP uses sample data)
3. Analyze candidates using Claude AI
4. Return the best matching recipe

The recipe will display with:
- Name and servings
- Prep and cook times
- Nutritional information
- Complete ingredient list (scaled to your servings)
- Step-by-step instructions
- Source attribution

### 5. Recipe Caching

Recipes are automatically cached for 7 days. If you search for the same thing with the same configuration, you'll get instant results from the cache!

## API Endpoints

The backend exposes these endpoints:

### Health Check
```
GET /health
```

Returns server status and cache statistics.

### Recipe Search
```
POST /api/recipes/search
Content-Type: application/json

{
  "query": "high protein pasta",
  "config": {
    "proteinPriority": true,
    "fiberPriority": false,
    "servings": 2
  }
}
```

### Chat (Future Feature)
```
POST /api/chat
Content-Type: application/json

{
  "message": "How do I dice an onion?",
  "conversationHistory": [],
  "lastRecipe": null
}
```

## Testing

### Run All Tests
```bash
npm test
```

### Run Backend Tests
```bash
npm run test --workspace=backend
```

### Run with Coverage
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
cd backend
npm test servingScaler.test.ts
```

## Building for Production

### Build Everything
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

The production build will:
- Compile TypeScript to JavaScript
- Bundle and optimize frontend assets
- Serve frontend from backend on port 3000

## Troubleshooting

### Port Already in Use

If port 3000 or 5173 is already in use:

1. Change backend port in `.env`:
   ```env
   PORT=3001
   ```

2. Update frontend proxy in `frontend/vite.config.ts`:
   ```typescript
   proxy: {
     '/api': {
       target: 'http://localhost:3001',
     },
   },
   ```

### API Key Error

If you see "ANTHROPIC_API_KEY is required":
1. Check `.env` file exists in project root
2. Verify API key format starts with `sk-ant-`
3. Restart the server after changing `.env`

### No Recipes Found

The MVP uses mock data. Keywords that match sample recipes:
- "protein", "chicken", "pasta"
- "vegetarian", "tofu", "stir fry"
- "quinoa", "mediterranean"
- "salmon", "asparagus"
- "overnight oats"
- "turkey", "burrito"

### Build Errors

If you encounter build errors:
1. Delete `node_modules`: `npm run clean`
2. Reinstall dependencies: `npm install`
3. Clear TypeScript cache: `rm -rf backend/dist frontend/dist`
4. Try building again: `npm run build`

## Development Workflow

### Making Changes

1. **Backend changes**: Edit files in `backend/src/`
   - Server auto-restarts with `tsx watch`
   - Check logs in terminal

2. **Frontend changes**: Edit files in `frontend/src/`
   - Browser auto-reloads with Vite HMR
   - Check browser console for errors

3. **Shared types**: Edit `shared/types.ts`
   - Restart both servers to pick up changes

### Code Quality

Before committing:
```bash
# Check formatting
npm run format:check

# Run linter
npm run lint

# Run tests
npm test

# Type check
npm run type-check
```

### Git Commits

Follow Conventional Commits format:
```bash
git commit -m "feat: add new recipe source"
git commit -m "fix: correct serving scaling for fractions"
git commit -m "docs: update README with examples"
```

## Project Structure

```
recipe-finder/
├── backend/           # Express API server
│   └── src/
│       ├── config/    # Environment config
│       ├── controllers/   # Request handlers
│       ├── models/    # Data models
│       ├── routes/    # API routes
│       ├── services/  # Business logic
│       ├── utils/     # Helper functions
│       └── server.ts  # Main server file
├── frontend/          # React application
│   └── src/
│       ├── components/    # React components
│       ├── hooks/     # Custom hooks
│       ├── lib/       # Utilities & API client
│       ├── App.tsx    # Root component
│       └── main.tsx   # Entry point
├── shared/            # Shared TypeScript types
├── spec/              # Project documentation
└── .env               # Environment variables (not committed)
```

## Next Steps

### MVP Limitations

This MVP uses:
- **Mock recipe scrapers** with 6 sample recipes
- Simplified error handling
- Basic chat (recipe search only)

### Future Enhancements

To build a production-ready version:
1. Implement real web scrapers (Puppeteer/Playwright)
2. Add recipe history and favorites
3. Implement full chat functionality
4. Add meal planning features
5. Build grocery list generator
6. Add user accounts and preferences
7. Implement voice input
8. Add more recipe sources

## Support

For issues or questions:
- Check the main [README.md](README.md)
- Review [spec/](spec/) documentation
- Check [deployment.md](spec/deployment.md) for production deployment

## API Costs

Using Claude API for recipe searches:
- ~$0.05 per recipe search
- ~$0.0005 per chat message
- Expected: ~$16.50/month (10 searches/day)

Monitor usage at: https://console.anthropic.com

---

**Happy cooking! Enjoy finding the perfect recipes with AI! 🍳**
