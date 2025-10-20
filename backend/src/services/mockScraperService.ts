import { logger } from '../utils/logger';
import type { ScrapedRecipe, SearchStrategy } from '../../../shared/types';

/**
 * Mock scraper service for MVP
 * Returns sample recipe data instead of actually scraping websites
 * In production, this would be replaced with real web scrapers
 */

const SAMPLE_RECIPES: ScrapedRecipe[] = [
  {
    platform: 'Instagram',
    author: 'Emily English',
    url: 'https://instagram.com/p/mock-recipe-1',
    timestamp: Date.now(),
    rawContent: `High Protein Chicken Pasta

Serves 2

Ingredients:
- 300g chicken breast, diced
- 200g whole wheat pasta
- 1 cup cherry tomatoes, halved
- 2 cloves garlic, minced
- 2 tbsp olive oil
- 1/4 cup parmesan cheese
- Fresh basil
- Salt and pepper to taste

Instructions:
1. Cook pasta according to package directions, drain and set aside
2. Heat olive oil in a large pan over medium-high heat
3. Season chicken with salt and pepper, cook until golden brown (6-7 minutes)
4. Add garlic and cherry tomatoes, cook for 2-3 minutes
5. Add cooked pasta to the pan, toss to combine
6. Top with parmesan and fresh basil
7. Serve immediately

Nutrition per serving:
Protein: 42g
Fiber: 8g
Calories: 520

Perfect for a post-workout meal! High in protein and delicious.`,
  },
  {
    platform: 'YouTube',
    author: 'Jamie Oliver',
    url: 'https://youtube.com/watch?v=mock-recipe-2',
    timestamp: Date.now(),
    rawContent: `HEALTHY VEGETABLE STIR FRY

Makes 4 servings

What you need:
- 400g firm tofu, cubed
- 2 cups broccoli florets
- 1 red bell pepper, sliced
- 1 cup snap peas
- 3 tbsp soy sauce
- 2 tbsp sesame oil
- 1 tbsp honey
- 2 tsp ginger, grated
- 2 cloves garlic, minced
- 2 cups brown rice, cooked
- Sesame seeds for garnish

How to make it:
1. Press tofu to remove excess water, then cube
2. Cook brown rice according to package instructions
3. Heat sesame oil in a wok over high heat
4. Add tofu, cook until golden (4-5 minutes), set aside
5. Add vegetables, stir fry for 3-4 minutes until crisp-tender
6. Mix soy sauce, honey, ginger, and garlic
7. Return tofu to wok, pour sauce over, toss to coat
8. Serve over brown rice, sprinkle with sesame seeds

Nutritional info (per serving):
Protein: 18g
Fiber: 12g
Calories: 380

This is absolutely brilliant! Packed with vegetables and flavor.`,
  },
  {
    platform: 'Web',
    author: 'Yotam Ottolenghi',
    url: 'https://ottolenghi.co.uk/mock-recipe-3',
    timestamp: Date.now(),
    rawContent: `Mediterranean Quinoa Bowl with Roasted Chickpeas

Servings: 2

Ingredients:
For the bowl:
- 1 cup quinoa, uncooked
- 1 can (400g) chickpeas, drained and rinsed
- 2 cups mixed greens
- 1 cucumber, diced
- 1 cup cherry tomatoes, halved
- 1/4 red onion, thinly sliced
- 1/4 cup kalamata olives
- 1/4 cup feta cheese, crumbled

For the chickpeas:
- 1 tbsp olive oil
- 1 tsp cumin
- 1 tsp paprika
- Salt and pepper

For the dressing:
- 3 tbsp olive oil
- 2 tbsp lemon juice
- 1 clove garlic, minced
- 1 tsp dried oregano

Method:
1. Preheat oven to 400°F (200°C)
2. Toss chickpeas with olive oil and spices, roast for 20-25 minutes until crispy
3. Cook quinoa according to package instructions
4. Mix dressing ingredients in a small bowl
5. Assemble bowls: divide quinoa between two bowls
6. Top with mixed greens, cucumber, tomatoes, onion, and olives
7. Add roasted chickpeas and crumbled feta
8. Drizzle with dressing

Nutrition per serving:
Protein: 22g
Fiber: 14g
Calories: 485

A vibrant, nourishing bowl full of Mediterranean flavors!`,
  },
  {
    platform: 'Instagram',
    author: 'Gordon Ramsay',
    url: 'https://instagram.com/p/mock-recipe-4',
    timestamp: Date.now(),
    rawContent: `PROTEIN-PACKED SALMON WITH ASPARAGUS

Serves: 2

You'll need:
- 2 salmon fillets (150g each)
- 1 bunch asparagus, trimmed
- 2 tbsp olive oil
- 1 lemon, sliced
- 2 cloves garlic, minced
- Fresh dill
- Salt and pepper

Let's go:
1. Preheat oven to 400°F (200°C)
2. Place salmon fillets on a baking sheet
3. Arrange asparagus around the salmon
4. Drizzle everything with olive oil
5. Season with salt, pepper, and minced garlic
6. Top salmon with lemon slices and fresh dill
7. Bake for 12-15 minutes until salmon is cooked through
8. Asparagus should be tender but still have a bite

Done!

Nutritional breakdown:
Protein: 38g
Fiber: 4g
Calories: 340

Simple, elegant, and absolutely delicious. This is how you do healthy cooking!`,
  },
  {
    platform: 'TikTok',
    author: 'Notorious Foodie',
    url: 'https://tiktok.com/@notoriousfoodie/mock-recipe-5',
    timestamp: Date.now(),
    rawContent: `VIRAL HIGH PROTEIN OVERNIGHT OATS 🔥

Prep time: 5 min (+ overnight)
Servings: 1

Ingredients:
- 1/2 cup rolled oats
- 1 scoop protein powder (vanilla)
- 1 cup almond milk
- 1 tbsp chia seeds
- 1 tbsp almond butter
- 1 tsp honey
- 1/2 banana, sliced
- Berries for topping

Instructions:
1. Mix oats, protein powder, almond milk, chia seeds in a jar
2. Stir in almond butter and honey
3. Top with banana slices
4. Cover and refrigerate overnight
5. In the morning, add fresh berries
6. Enjoy cold or heat for 1 minute

Macros per serving:
Protein: 35g
Fiber: 11g
Calories: 420

This is INSANE! Tastes like dessert but it's actually healthy! 💪

#highprotein #overnightoats #healthybreakfast #mealprep`,
  },
  {
    platform: 'Web',
    author: 'Emily English',
    url: 'https://emilyjeannutrition.com/mock-recipe-6',
    timestamp: Date.now(),
    rawContent: `Turkey & Black Bean Burrito Bowl (High Protein & Fiber!)

Serves: 4

Ingredients:
Base:
- 500g ground turkey
- 2 cups cooked brown rice
- 1 can (400g) black beans, drained
- 1 cup corn
- 2 cups lettuce, shredded

Toppings:
- 1 cup salsa
- 1/2 cup Greek yogurt
- 1 avocado, sliced
- 1/4 cup cheddar cheese, shredded
- Fresh cilantro
- Lime wedges

Seasoning:
- 1 tbsp cumin
- 1 tbsp chili powder
- 1 tsp garlic powder
- Salt and pepper

Instructions:
1. Cook brown rice according to package directions
2. Brown ground turkey in a large skillet
3. Add black beans, corn, and all seasonings
4. Cook for 5-7 minutes until heated through
5. Assemble bowls: start with rice, add turkey mixture
6. Top with lettuce, salsa, Greek yogurt, avocado, cheese
7. Garnish with cilantro and serve with lime wedges

Nutritional Information (per serving):
Protein: 38g
Fiber: 13g
Calories: 520

This is my go-to meal prep recipe! Nutritious, filling, and absolutely delicious. The combination of protein from turkey and fiber from beans keeps you satisfied for hours!`,
  },
];

/**
 * Mock scraper that returns sample recipes based on search strategy
 * In production, this would actually scrape websites
 */
export async function scrapeRecipes(strategy: SearchStrategy): Promise<ScrapedRecipe[]> {
  logger.info('Mock scraper: simulating recipe scraping', {
    keywords: strategy.keywords,
    sourcesCount: strategy.sources.length,
  });

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Filter recipes based on keywords (simple mock logic)
  const keywords = strategy.keywords.map((k) => k.toLowerCase());

  const filteredRecipes = SAMPLE_RECIPES.filter((recipe) => {
    const content = recipe.rawContent.toLowerCase();
    return keywords.some((keyword) => content.includes(keyword));
  });

  // If no matches found, return a few random recipes
  if (filteredRecipes.length === 0) {
    logger.info('Mock scraper: no keyword matches, returning sample recipes');
    return SAMPLE_RECIPES.slice(0, 3);
  }

  logger.info('Mock scraper: recipes scraped', { count: filteredRecipes.length });

  return filteredRecipes;
}
