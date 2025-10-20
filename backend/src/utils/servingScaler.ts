import type { Recipe, Ingredient } from '../../../shared/types';

/**
 * Parse a quantity string to a number
 * Handles fractions, mixed numbers, and decimal values
 */
export function parseQuantity(quantity: string): number | null {
  const trimmed = quantity.trim().toLowerCase();

  // Handle "to taste", "pinch", "dash", etc.
  const nonScalableTerms = ['to taste', 'pinch', 'dash', 'handful', 'splash'];
  if (nonScalableTerms.some((term) => trimmed.includes(term))) {
    return null;
  }

  // Extract numeric part (handle mixed numbers like "1 1/2")
  const mixedMatch = trimmed.match(/(\d+)\s+(\d+)\/(\d+)/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const numerator = parseInt(mixedMatch[2], 10);
    const denominator = parseInt(mixedMatch[3], 10);
    return whole + numerator / denominator;
  }

  // Handle simple fractions like "1/2"
  const fractionMatch = trimmed.match(/(\d+)\/(\d+)/);
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1], 10);
    const denominator = parseInt(fractionMatch[2], 10);
    return numerator / denominator;
  }

  // Handle decimals and whole numbers
  const numberMatch = trimmed.match(/(\d+\.?\d*)/);
  if (numberMatch) {
    return parseFloat(numberMatch[1]);
  }

  return null;
}

/**
 * Convert a decimal to a fractional string
 * Rounds to common cooking fractions (1/4, 1/3, 1/2, 2/3, 3/4)
 */
export function toFraction(decimal: number): string {
  const whole = Math.floor(decimal);
  const fraction = decimal - whole;

  // Common cooking fractions
  const fractions = [
    { value: 0, str: '' },
    { value: 0.25, str: '1/4' },
    { value: 0.33, str: '1/3' },
    { value: 0.5, str: '1/2' },
    { value: 0.67, str: '2/3' },
    { value: 0.75, str: '3/4' },
  ];

  // Find closest fraction
  let closest = fractions[0];
  let minDiff = Math.abs(fraction - closest.value);

  for (const frac of fractions) {
    const diff = Math.abs(fraction - frac.value);
    if (diff < minDiff) {
      minDiff = diff;
      closest = frac;
    }
  }

  // If very close to a whole number, round it
  if (minDiff < 0.05) {
    if (closest.value === 0) {
      return whole.toString();
    }
    return (whole + 1).toString();
  }

  // Build result
  if (whole === 0) {
    return closest.str;
  }
  if (closest.str === '') {
    return whole.toString();
  }
  return `${whole} ${closest.str}`;
}

/**
 * Scale an ingredient quantity from one serving size to another
 */
export function scaleIngredient(
  ingredient: Ingredient,
  fromServings: number,
  toServings: number
): Ingredient {
  const parsedQuantity = parseQuantity(ingredient.quantity);

  // If quantity can't be parsed or is non-scalable, return as-is
  if (parsedQuantity === null) {
    return { ...ingredient };
  }

  // Calculate scaled quantity
  const scaleFactor = toServings / fromServings;
  const scaledQuantity = parsedQuantity * scaleFactor;

  // Extract unit from original quantity
  const unitMatch = ingredient.quantity.match(/[a-zA-Z]+/);
  const unit = unitMatch ? unitMatch[0] : '';

  // Format scaled quantity
  const quantityStr = toFraction(scaledQuantity);
  const newQuantity = unit ? `${quantityStr} ${unit}` : quantityStr;

  return {
    ...ingredient,
    quantity: newQuantity,
  };
}

/**
 * Scale all ingredients in a recipe to a new serving size
 */
export function scaleRecipeServings(recipe: Recipe, newServings: number): Recipe {
  const scaledIngredients = recipe.ingredients.map((ingredient) =>
    scaleIngredient(ingredient, recipe.servings, newServings)
  );

  return {
    ...recipe,
    servings: newServings,
    ingredients: scaledIngredients,
  };
}
