import type { Recipe } from '../../../shared/types';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps): JSX.Element {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden mt-2">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-white">
        <h3 className="text-lg font-semibold">{recipe.name}</h3>
        <div className="flex items-center space-x-4 text-sm mt-1">
          <span>🍽️ Serves {recipe.servings}</span>
          {recipe.prepTime && <span>⏱️ Prep: {recipe.prepTime}min</span>}
          {recipe.cookTime && <span>🔥 Cook: {recipe.cookTime}min</span>}
        </div>
      </div>

      {/* Nutrition Info */}
      {recipe.nutrition && (
        <div className="bg-blue-50 px-4 py-2 border-b border-slate-200">
          <div className="flex justify-around text-sm">
            <div className="text-center">
              <div className="font-semibold text-blue-900">{recipe.nutrition.protein}g</div>
              <div className="text-blue-600 text-xs">Protein</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-900">{recipe.nutrition.fiber}g</div>
              <div className="text-blue-600 text-xs">Fiber</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-900">{recipe.nutrition.calories}</div>
              <div className="text-blue-600 text-xs">Calories</div>
            </div>
          </div>
        </div>
      )}

      {/* Ingredients */}
      <div className="px-4 py-3 border-b border-slate-200">
        <h4 className="font-semibold text-slate-900 mb-2">Ingredients</h4>
        <ul className="space-y-1">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className="text-sm text-slate-700 flex">
              <span className="text-blue-600 mr-2">•</span>
              <span>
                <span className="font-medium">{ingredient.quantity}</span> {ingredient.name}
                {ingredient.notes && (
                  <span className="text-slate-500 italic"> ({ingredient.notes})</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Instructions */}
      <div className="px-4 py-3 border-b border-slate-200">
        <h4 className="font-semibold text-slate-900 mb-2">Instructions</h4>
        <ol className="space-y-2">
          {recipe.instructions.map((instruction, index) => (
            <li key={index} className="text-sm text-slate-700 flex">
              <span className="font-semibold text-blue-600 mr-2 min-w-[20px]">{index + 1}.</span>
              <span>{instruction}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Source */}
      <div className="px-4 py-2 bg-slate-50 text-xs text-slate-600">
        <span className="font-medium">{recipe.source.platform}</span> •{' '}
        <span>{recipe.source.author}</span> •{' '}
        <a
          href={recipe.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          View Source
        </a>
      </div>
    </div>
  );
}
