import type { SearchConfig as SearchConfigType } from '../../../shared/types';

interface SearchConfigProps {
  config: SearchConfigType;
  onConfigChange: (config: SearchConfigType) => void;
}

export function SearchConfig({ config, onConfigChange }: SearchConfigProps): JSX.Element {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-4">Search Preferences</h2>

      {/* Protein Priority */}
      <div className="mb-4">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.proteinPriority}
            onChange={(e) =>
              onConfigChange({ ...config, proteinPriority: e.target.checked })
            }
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <div className="font-medium text-slate-900">High Protein</div>
            <div className="text-sm text-slate-500">&gt;25g per serving</div>
          </div>
        </label>
      </div>

      {/* Fiber Priority */}
      <div className="mb-4">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.fiberPriority}
            onChange={(e) =>
              onConfigChange({ ...config, fiberPriority: e.target.checked })
            }
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <div className="font-medium text-slate-900">High Fiber</div>
            <div className="text-sm text-slate-500">&gt;8g per serving</div>
          </div>
        </label>
      </div>

      {/* Servings Selector */}
      <div className="mb-4">
        <label className="block mb-2">
          <span className="font-medium text-slate-900">Servings</span>
        </label>
        <select
          value={config.servings}
          onChange={(e) =>
            onConfigChange({ ...config, servings: parseInt(e.target.value, 10) })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <option key={num} value={num}>
              {num} {num === 1 ? 'person' : 'persons'}
            </option>
          ))}
        </select>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="font-medium text-blue-900 mb-2">Preferred Chefs</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Emily English</li>
          <li>• Gordon Ramsay</li>
          <li>• Jamie Oliver</li>
          <li>• Yotam Ottolenghi</li>
          <li>• Notorious Foodie</li>
        </ul>
      </div>
    </div>
  );
}
