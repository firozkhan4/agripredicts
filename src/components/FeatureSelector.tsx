import React from 'react';
import type { FeatureStats, FeatureType } from '../type.ts';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface Props {
  stats: FeatureStats[];
  selectedFeatures: FeatureType[];
  onSelect: (features: FeatureType[]) => void;
  onFeatureToggle: (feature: FeatureType) => void;
}

const FeatureSelector: React.FC<Props> = ({
  stats,
  selectedFeatures,
  onSelect,
  onFeatureToggle
}) => {
  // Sort stats by F-Score descending to find the "Best" predictors
  const sortedStats = [...stats].sort((a, b) => b.fScore - a.fScore);
  const bestFeatures = sortedStats.slice(0, 2); // Top 2 as recommended

  const handleSelectAll = () => {
    const allFeatures = stats.map(stat => stat.feature);
    onSelect(allFeatures);
  };

  const handleClearAll = () => {
    onSelect([]);
  };

  const handleSelectRecommended = () => {
    onSelect(bestFeatures.map(f => f.feature));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          1. Feature Selection Analysis
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={handleSelectRecommended}
            className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
          >
            Select Recommended
          </button>
          <button
            onClick={handleSelectAll}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Select All
          </button>
          <button
            onClick={handleClearAll}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      <p className="text-gray-600 mb-6">
        Select <strong>multiple features</strong> for more accurate crop prediction. Based on our analysis of variance (ANOVA),
        we recommend features that best distinguish between crop types.
      </p>

      {/* Selection Summary */}
      {selectedFeatures.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 font-medium">
                Selected {selectedFeatures.length} feature{selectedFeatures.length > 1 ? 's' : ''}
              </p>
              <p className="text-green-600 text-sm mt-1">
                {selectedFeatures.map(feature => feature.replace('_', ' ')).join(', ')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-green-800 font-medium">
                Est. Accuracy: {Math.min(95, 70 + (selectedFeatures.length * 5))}%
              </p>
              <p className="text-green-600 text-sm">Multi-feature model</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sortedStats.map((stat) => {
          const isRecommended = bestFeatures.some(f => f.feature === stat.feature);
          const isSelected = selectedFeatures.includes(stat.feature);

          return (
            <div
              key={stat.feature}
              onClick={() => onFeatureToggle(stat.feature)}
              className={`
                relative cursor-pointer border rounded-lg p-4 transition-all duration-200
                ${isSelected ? 'border-green-600 bg-green-50 ring-2 ring-green-200' : 'border-gray-200 hover:border-green-300'}
                ${isRecommended && !isSelected ? 'border-yellow-300 bg-yellow-50' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-5 h-5 rounded-full border flex items-center justify-center 
                    ${isSelected ? 'border-green-600 bg-green-600' : 'border-gray-400'}
                  `}>
                    {isSelected && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {stat.feature.replace('_', ' ')}
                      {isRecommended && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          Recommended
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">{stat.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    Score: {stat.fScore.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Est. Accuracy: {(stat.accuracy * 100).toFixed(1)}%
                  </div>
                  {isSelected && (
                    <div className="text-xs text-green-600 font-medium mt-1">
                      ✓ Selected
                    </div>
                  )}
                </div>
              </div>

              {/* Visual Bar for Score */}
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${isRecommended ? 'bg-yellow-500' : 'bg-blue-400'
                    } ${isSelected ? 'bg-green-500' : ''}`}
                  style={{ width: `${(stat.fScore / sortedStats[0].fScore) * 100}%` }}
                ></div>
              </div>

              {/* Selection order indicator for multiple selections */}
              {isSelected && (
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {selectedFeatures.indexOf(stat.feature) + 1}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selection Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-blue-800 font-medium mb-2">Selection Tips</p>
            <ul className="text-blue-700 text-sm space-y-1 list-disc pl-4">
              <li>Select 2-4 features for optimal accuracy</li>
              <li>Recommended features have the highest F-scores</li>
              <li>Combining soil nutrients with environmental factors often works best</li>
              <li>Click on any feature to toggle selection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureSelector;
