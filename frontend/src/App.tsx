import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SearchConfig } from './components/SearchConfig';
import { ChatInterface } from './components/ChatInterface';
import type { SearchConfig as SearchConfigType, Recipe } from '../../shared/types';

const queryClient = new QueryClient();

function AppContent(): JSX.Element {
  const [searchConfig, setSearchConfig] = useState<SearchConfigType>({
    proteinPriority: false,
    fiberPriority: false,
    servings: 2,
  });

  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Recipe Finder AI</h1>
          <p className="text-slate-600">
            Find recipes optimized for your nutritional priorities
          </p>
        </header>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Search Config */}
          <div className="lg:col-span-1">
            <SearchConfig config={searchConfig} onConfigChange={setSearchConfig} />
          </div>

          {/* Main Content - Chat */}
          <div className="lg:col-span-3">
            <ChatInterface
              searchConfig={searchConfig}
              currentRecipe={currentRecipe}
              onRecipeFound={setCurrentRecipe}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
