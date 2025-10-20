import { describe, it, expect } from 'vitest';
import {
  parseQuantity,
  toFraction,
  scaleIngredient,
  scaleRecipeServings,
} from './servingScaler';
import type { Recipe, Ingredient } from '../../../shared/types';

describe('servingScaler', () => {
  describe('parseQuantity', () => {
    it('should parse whole numbers', () => {
      expect(parseQuantity('2')).toBe(2);
      expect(parseQuantity('10')).toBe(10);
    });

    it('should parse decimals', () => {
      expect(parseQuantity('1.5')).toBe(1.5);
      expect(parseQuantity('2.25')).toBe(2.25);
    });

    it('should parse simple fractions', () => {
      expect(parseQuantity('1/2')).toBe(0.5);
      expect(parseQuantity('1/4')).toBe(0.25);
      expect(parseQuantity('3/4')).toBe(0.75);
    });

    it('should parse mixed numbers', () => {
      expect(parseQuantity('1 1/2')).toBe(1.5);
      expect(parseQuantity('2 1/4')).toBe(2.25);
      expect(parseQuantity('3 3/4')).toBe(3.75);
    });

    it('should parse quantities with units', () => {
      expect(parseQuantity('2 cups')).toBe(2);
      expect(parseQuantity('1/2 cup')).toBe(0.5);
      expect(parseQuantity('1 1/2 tbsp')).toBe(1.5);
    });

    it('should return null for non-scalable quantities', () => {
      expect(parseQuantity('to taste')).toBeNull();
      expect(parseQuantity('pinch')).toBeNull();
      expect(parseQuantity('dash')).toBeNull();
      expect(parseQuantity('a handful')).toBeNull();
    });

    it('should handle extra whitespace', () => {
      expect(parseQuantity('  2  cups  ')).toBe(2);
      expect(parseQuantity('1  1/2')).toBe(1.5);
    });
  });

  describe('toFraction', () => {
    it('should convert decimals to fractions', () => {
      expect(toFraction(0.25)).toBe('1/4');
      expect(toFraction(0.5)).toBe('1/2');
      expect(toFraction(0.75)).toBe('3/4');
    });

    it('should handle mixed numbers', () => {
      expect(toFraction(1.25)).toBe('1 1/4');
      expect(toFraction(2.5)).toBe('2 1/2');
      expect(toFraction(3.75)).toBe('3 3/4');
    });

    it('should round to nearest common fraction', () => {
      expect(toFraction(0.33)).toBe('1/3');
      expect(toFraction(0.67)).toBe('2/3');
    });

    it('should handle whole numbers', () => {
      expect(toFraction(2)).toBe('2');
      expect(toFraction(5)).toBe('5');
    });

    it('should round values very close to whole numbers', () => {
      expect(toFraction(0.98)).toBe('1');
      expect(toFraction(1.02)).toBe('1');
      expect(toFraction(2.96)).toBe('3');
    });
  });

  describe('scaleIngredient', () => {
    it('should scale simple quantities', () => {
      const ingredient: Ingredient = {
        quantity: '2 cups',
        name: 'flour',
      };

      const scaled = scaleIngredient(ingredient, 2, 4);

      expect(scaled.quantity).toBe('4 cups');
      expect(scaled.name).toBe('flour');
    });

    it('should scale fractional quantities', () => {
      const ingredient: Ingredient = {
        quantity: '1/2 cup',
        name: 'sugar',
      };

      const scaled = scaleIngredient(ingredient, 4, 2);

      expect(scaled.quantity).toBe('1/4 cup');
    });

    it('should scale mixed number quantities', () => {
      const ingredient: Ingredient = {
        quantity: '1 1/2 cups',
        name: 'milk',
      };

      const scaled = scaleIngredient(ingredient, 2, 4);

      expect(scaled.quantity).toBe('3 cups');
    });

    it('should preserve non-scalable quantities', () => {
      const ingredient: Ingredient = {
        quantity: 'to taste',
        name: 'salt',
      };

      const scaled = scaleIngredient(ingredient, 2, 6);

      expect(scaled.quantity).toBe('to taste');
    });

    it('should preserve notes', () => {
      const ingredient: Ingredient = {
        quantity: '2 cups',
        name: 'chicken',
        notes: 'diced',
      };

      const scaled = scaleIngredient(ingredient, 2, 4);

      expect(scaled.notes).toBe('diced');
    });

    it('should handle scaling down', () => {
      const ingredient: Ingredient = {
        quantity: '4 cups',
        name: 'water',
      };

      const scaled = scaleIngredient(ingredient, 4, 1);

      expect(scaled.quantity).toBe('1 cups');
    });
  });

  describe('scaleRecipeServings', () => {
    it('should scale all ingredients in a recipe', () => {
      const recipe: Recipe = {
        name: 'Test Recipe',
        servings: 2,
        ingredients: [
          { quantity: '1 cup', name: 'rice' },
          { quantity: '2 cups', name: 'water' },
          { quantity: 'to taste', name: 'salt' },
        ],
        instructions: ['Cook rice'],
        source: {
          platform: 'Web',
          author: 'Test Author',
          url: 'https://example.com',
        },
      };

      const scaled = scaleRecipeServings(recipe, 4);

      expect(scaled.servings).toBe(4);
      expect(scaled.ingredients[0].quantity).toBe('2 cup');
      expect(scaled.ingredients[1].quantity).toBe('4 cups');
      expect(scaled.ingredients[2].quantity).toBe('to taste');
    });

    it('should preserve all other recipe properties', () => {
      const recipe: Recipe = {
        name: 'Test Recipe',
        servings: 2,
        prepTime: 15,
        cookTime: 30,
        ingredients: [{ quantity: '1 cup', name: 'rice' }],
        instructions: ['Cook rice', 'Serve'],
        nutrition: {
          protein: 10,
          fiber: 5,
          calories: 200,
        },
        source: {
          platform: 'Instagram',
          author: 'Emily English',
          url: 'https://instagram.com/p/example',
        },
      };

      const scaled = scaleRecipeServings(recipe, 4);

      expect(scaled.name).toBe('Test Recipe');
      expect(scaled.prepTime).toBe(15);
      expect(scaled.cookTime).toBe(30);
      expect(scaled.instructions).toEqual(['Cook rice', 'Serve']);
      expect(scaled.nutrition).toEqual({
        protein: 10,
        fiber: 5,
        calories: 200,
      });
      expect(scaled.source).toEqual(recipe.source);
    });
  });
});
