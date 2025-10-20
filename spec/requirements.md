# Recipe Finder AI Agent - Requirements Specification

## 1. User Profile

**Primary User**: Health-conscious 35-year-old man
- Enjoys cooking and experimenting with recipes
- Values flexibility and control over search options
- Prioritizes nutritional content (protein and fiber)
- Needs portion control for various serving sizes

## 2. Project Overview

An AI-powered recipe finder that searches the internet for recipes based on user prompts and configurable search criteria. The application uses Claude AI to intelligently search, analyze, and present the best-matching recipe in a clean, standardized format.

## 3. Core Functional Requirements

### 3.1 User Interface
- **Chatbot-style interface** for natural conversation with the AI agent
- **Configurable search panel** with the following options:
  - Protein priority toggle (high priority for protein-rich recipes)
  - Fiber priority toggle (high priority for fiber-rich recipes)
  - Servings selector (range: 1-8 persons)
  - Additional dietary preferences (optional filters)

### 3.2 Search Functionality
- Accept natural language recipe queries from user
- Search across prioritized sources (see section 4)
- Apply user's configured search criteria to filter and rank results
- Return the **single best-suited recipe** based on query and preferences

### 3.3 Recipe Response Format
The AI agent must return recipes in the following standardized format:

**Required Fields:**
1. **Dish Name** - Clear, descriptive name of the recipe
2. **Number of Servings** - Adjusted to user's selected serving size (1-8)
3. **Ingredients** - Complete list with quantities adjusted for servings
4. **Step-by-Step Instructions** - Numbered cooking instructions

**Content Filtering:**
- Strip out all extraneous content from sources including:
  - Ads and promotional content
  - Personal anecdotes or stories
  - Social media engagement prompts (likes, follows, etc.)
  - Unrelated commentary
  - Sponsor messages
- Preserve only essential recipe information

### 3.4 Nutritional Priorities
- Prioritize recipes **high in protein** when protein toggle is enabled
- Prioritize recipes **high in fiber** when fiber toggle is enabled
- Display approximate nutritional information when available (protein, fiber, calories)
- Allow both priorities to be enabled simultaneously

## 4. Prioritized Recipe Sources

The AI agent should search the following sources in order of priority:

1. **Instagram** - Recipe posts and reels from chefs and food creators
2. **TikTok** - Recipe videos and content
3. **YouTube** - Cooking videos and recipe demonstrations
4. **Website Articles** - Recipe blogs, food websites, and cooking publications

### 4.1 Preferred Chefs and Content Creators
Prioritize content from the following chefs when available:

1. **Emily English** - Nutrition-focused recipes
2. **Gordon Ramsay** - Professional cooking techniques
3. **Jamie Oliver** - Simple, healthy home cooking
4. **Yotam Ottolenghi** - Vegetable-forward, flavorful dishes
5. **Notorious Foodie** - Modern, creative recipes

## 5. Technical Requirements

### 5.1 Deployment
- **Locally hosted solution** on user's laptop
- No cloud deployment required
- Must work offline after initial setup (except for internet recipe searches)

### 5.2 AI Integration
- Use **existing Claude subscription** and Claude API
- Leverage Claude models for:
  - Natural language understanding of recipe queries
  - Intelligent web search and content extraction
  - Recipe parsing and standardization
  - Nutritional analysis and prioritization

### 5.3 Performance
- Response time: < 10 seconds for typical recipe search
- Efficient API usage to minimize costs
- Cache frequently accessed recipes (optional enhancement)

## 6. User Experience Requirements

### 6.1 Interaction Flow
1. User configures search preferences (protein, fiber, servings)
2. User enters recipe query in chat interface (e.g., "high protein pasta dish")
3. AI agent searches prioritized sources
4. AI agent analyzes and ranks results based on criteria
5. AI agent returns single best recipe in standardized format
6. User can refine search or ask follow-up questions

### 6.2 Conversation Features
- Support natural language refinement (e.g., "make it vegetarian")
- Allow serving size adjustments in conversation
- Enable recipe substitution requests (e.g., "swap chicken for tofu")
- Provide cooking tips when asked

### 6.3 Flexibility & Control
- All search criteria must be adjustable before each search
- Clear indication of which filters are active
- Easy toggle on/off for each preference
- Save common search configurations (future enhancement)

## 7. Content Quality Requirements

### 7.1 Recipe Validation
- Ensure recipes include complete ingredient lists
- Verify step-by-step instructions are coherent and complete
- Check that serving sizes make sense (avoid obviously wrong portions)
- Flag recipes with missing critical information

### 7.2 Nutritional Accuracy
- Source nutritional data when available from recipe
- Provide estimates when exact data is unavailable
- Clearly distinguish between verified and estimated nutrition info
- Prioritize recipes with verified nutritional information

## 8. Non-Functional Requirements

### 8.1 Reliability
- Handle cases where no suitable recipes are found
- Gracefully handle API failures or rate limits
- Provide clear error messages to user

### 8.2 Maintainability
- Clean, well-documented codebase
- Modular architecture for easy updates
- Configurable source priorities
- Easy to add new recipe sources

### 8.3 Usability
- Intuitive interface requiring minimal learning
- Clear visual feedback during search operations
- Responsive design for different screen sizes
- Accessible to users with disabilities (WCAG 2.1 AA)

## 9. Success Criteria

The application is successful if:
- User can find relevant, high-quality recipes in < 10 seconds
- Nutritional priorities accurately influence recipe selection
- Recipe format is consistent, clean, and easy to follow
- User satisfaction with recipe quality and relevance > 80%
- Application runs reliably on local machine
- Claude API costs remain within reasonable bounds (< $10/month for typical usage)

## 10. Future Enhancements (Out of Scope for MVP)

- Recipe history and favorites
- Meal planning across multiple days
- Grocery list generation
- Recipe scaling and unit conversion
- Nutritional goal tracking
- Integration with fitness apps
- Voice input for hands-free cooking
- Recipe sharing with friends
- Offline recipe storage
- Multi-language support
