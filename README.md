# Recipe Finder AI Agent

> An intelligent, locally-hosted recipe discovery application powered by Claude AI that finds and presents recipes optimized for your nutritional priorities and preferences.

## Overview

Recipe Finder is a chatbot-style application that searches the internet for recipes based on your specific dietary needs. Simply tell it what you're looking for, configure your nutritional priorities (protein, fiber), and specify serving sizes - the AI will find and present the best-matching recipe in a clean, standardized format.

### Key Features

- **AI-Powered Recipe Search** - Leverages Claude 3.5 Sonnet for intelligent recipe discovery and analysis
- **Nutritional Prioritization** - Configure high protein and/or high fiber preferences
- **Flexible Serving Sizes** - Scale recipes from 1 to 8 servings with automatic ingredient adjustment
- **Multi-Source Aggregation** - Searches Instagram, TikTok, YouTube, and recipe websites
- **Preferred Chefs** - Prioritizes content from Emily English, Gordon Ramsay, Jamie Oliver, Yotam Ottolenghi, and Notorious Foodie
- **Clean Recipe Format** - Automatically strips ads, stories, and promotional content
- **Chat Interface** - Natural conversation for recipe refinement and cooking questions
- **Local & Private** - Runs entirely on your laptop, no cloud deployment needed

## Screenshots

*Coming soon - application under development*

## Tech Stack

### Frontend
- **React** with TypeScript
- **Tailwind CSS** + shadcn/ui
- **Vite** for build tooling
- **React Query** for state management

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Anthropic Claude SDK** for AI integration
- **Puppeteer/Playwright** for web scraping
- **SQLite** for caching

### Testing
- **Vitest** for unit and integration tests
- **Playwright** for E2E testing
- **React Testing Library** for component tests

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Claude API Key** - Get yours at [console.anthropic.com](https://console.anthropic.com/settings/keys)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/joecwhite/recipes-finder.git
cd recipes-finder
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Claude API key:

```env
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
NODE_ENV=development
PORT=3000
```

**Important**: Never commit your `.env` file to version control. It's already included in `.gitignore`.

### 4. Start the Application

**Development Mode:**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

**Production Mode:**
```bash
npm run build
npm start
```

## Usage

### Basic Recipe Search

1. Open the application in your browser
2. Configure your search preferences:
   - Toggle **High Protein** if you want protein-rich recipes
   - Toggle **High Fiber** for fiber-rich options
   - Select **Servings** (1-8 persons)
3. Type your recipe query in the chat (e.g., "high protein pasta dish")
4. The AI will search multiple sources and return the best recipe

### Recipe Refinement

You can refine recipes through conversation:

```
You: "high protein chicken recipe"
AI: [Returns a recipe]

You: "make it vegetarian"
AI: [Returns updated vegetarian version]

You: "increase servings to 4"
AI: [Scales recipe to 4 servings]
```

### Cooking Questions

Ask follow-up questions about the recipe:

```
You: "how do I dice an onion?"
You: "can I substitute quinoa for rice?"
You: "what temperature should the oven be?"
```

## Recipe Output Format

Each recipe includes:

- **Dish Name** - Clear, descriptive title
- **Servings** - Adjusted to your selection
- **Prep & Cook Time** - Estimated durations
- **Ingredients** - Complete list with quantities scaled to servings
- **Instructions** - Step-by-step cooking directions
- **Nutrition** - Protein, fiber, and calorie information (when available)
- **Source** - Platform, chef/author, and original URL

**Content Filtering**: All ads, personal stories, engagement prompts, and non-recipe content are automatically removed.

## Project Structure

```
recipes-finder/
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and API client
│   │   └── App.tsx        # Root component
│   └── package.json
├── backend/               # Express server
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── scrapers/      # Web scraping modules
│   │   ├── parsers/       # Recipe parsing
│   │   └── server.ts      # Express setup
│   └── package.json
├── shared/                # Shared TypeScript types
├── spec/                  # Project documentation
│   ├── requirements.md
│   ├── design.md
│   ├── claude-access.md
│   ├── development-practices.md
│   └── deployment.md
└── README.md
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check
```

### Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Write tests first (TDD approach)
3. Implement feature
4. Run tests and linting
5. Commit with conventional commits format
6. Push and create pull request

See [spec/development-practices.md](spec/development-practices.md) for detailed guidelines.

## Deployment

Follow the comprehensive deployment checklist in [spec/deployment.md](spec/deployment.md).

**Quick deployment verification:**

```bash
# Run full pre-deployment test suite
npm run type-check && \
npm run lint -- --max-warnings 0 && \
npm run format:check && \
npm run test:coverage && \
npm run build
```

## API Costs

Using Claude 3.5 Sonnet for recipe searches:

- **Per recipe search**: ~$0.05
- **Per chat message**: ~$0.0005
- **Expected monthly cost** (10 searches/day + 20 chats/day): ~$16.50/month

See [spec/claude-access.md](spec/claude-access.md) for detailed cost analysis and optimization strategies.

## Configuration

### Search Preferences

Default preferences can be configured in the frontend settings:

- **Protein Priority**: `true` | `false`
- **Fiber Priority**: `true` | `false`
- **Default Servings**: `1-8`

### Recipe Sources

Source priority (configurable in backend):

1. Instagram (preferred chefs first)
2. TikTok (trending recipes)
3. YouTube (cooking videos)
4. Recipe websites (articles)

### Preferred Chefs

Searches prioritize content from:

- Emily English - Nutrition-focused recipes
- Gordon Ramsay - Professional techniques
- Jamie Oliver - Healthy home cooking
- Yotam Ottolenghi - Vegetable-forward dishes
- Notorious Foodie - Modern creative recipes

## Documentation

Comprehensive documentation is available in the `spec/` folder:

- **[Requirements](spec/requirements.md)** - Feature specifications and user requirements
- **[Design](spec/design.md)** - Technical architecture and implementation details
- **[Claude Access](spec/claude-access.md)** - API integration guide and best practices
- **[Development Practices](spec/development-practices.md)** - Coding standards and workflows
- **[Deployment](spec/deployment.md)** - Step-by-step deployment checklist

## Troubleshooting

### Common Issues

**Application won't start**
- Verify Node.js version: `node --version` (should be v18+)
- Check `.env` file exists with valid `ANTHROPIC_API_KEY`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

**No recipes found**
- Check internet connection
- Verify Claude API key is valid
- Check API usage limits in [Anthropic Console](https://console.anthropic.com)
- Review server logs for scraping errors

**Slow recipe searches**
- Expected time: <10 seconds
- Check network latency
- Verify rate limiting isn't active
- Consider clearing recipe cache

**Type errors during build**
- Run: `npm run type-check` to see detailed errors
- Ensure all dependencies are installed: `npm ci`

### Logs

Application logs are stored in:
- Development: Console output
- Production: `logs/application.log`

View logs:
```bash
tail -f logs/application.log
```

## Contributing

This is a personal project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create a feature branch
3. Follow coding standards in [development-practices.md](spec/development-practices.md)
4. Write tests for new features
5. Submit a pull request

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scraper): add Instagram recipe extraction
fix(parser): handle fractional ingredient quantities
docs(readme): update installation instructions
test(serving-scaler): add edge case tests
```

## Security

### API Key Safety

- **Never commit** `.env` files to version control
- Store API keys in environment variables only
- Rotate API keys periodically
- Set usage limits in Anthropic Console

### Reporting Security Issues

If you discover a security vulnerability, please email: joecwhite90@gmail.com

Do not open public issues for security vulnerabilities.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Anthropic** - For the powerful Claude API
- **Preferred Chefs** - Emily English, Gordon Ramsay, Jamie Oliver, Yotam Ottolenghi, Notorious Foodie
- **Open Source Community** - For the amazing tools and libraries used in this project

## Roadmap

### Current Version: 0.1.0 (In Development)

**Phase 1: Core Infrastructure** (Week 1-2)
- [x] Project specifications and documentation
- [x] Git repository setup
- [ ] Project structure and dependencies
- [ ] Claude API integration
- [ ] Basic chat interface

**Phase 2: Search & Scraping** (Week 3-4)
- [ ] Web scrapers (Instagram, TikTok, YouTube, articles)
- [ ] Recipe parser and content filter
- [ ] Claude-powered recipe analysis
- [ ] Caching layer

**Phase 3: UI & UX Polish** (Week 5)
- [ ] Search configuration UI
- [ ] Recipe display component
- [ ] Loading states and error handling
- [ ] Serving size scaling

**Phase 4: Testing & Refinement** (Week 6)
- [ ] Comprehensive test suite
- [ ] Performance optimization
- [ ] Bug fixes and edge cases

**Phase 5: Launch** (Week 7)
- [ ] Final testing and deployment
- [ ] User documentation
- [ ] Production release

### Future Enhancements

- Recipe history and favorites
- Meal planning across multiple days
- Grocery list generation
- Nutritional goal tracking
- Voice input for hands-free cooking
- Recipe sharing capabilities
- Offline recipe storage
- Multi-language support

## Contact

**Joe White**
- Email: joecwhite90@gmail.com
- GitHub: [@joecwhite](https://github.com/joecwhite)

## Project Status

**Status**: 🚧 Active Development

This project is currently in active development. The specification phase is complete, and implementation is beginning.

---

**Built with ❤️ using Claude Code**

*An AI-powered recipe finder for health-conscious home cooks*
