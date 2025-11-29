import React from 'react';
import type { FeatureStats, FeatureType } from '../type.ts';
// import { CheckCircle, AlertTriangle } from 'lucide-react';


interface Props {
  stats: FeatureStats[];
  selectedFeature: FeatureType;
  onSelect: (feature: FeatureType) => void;
}

const FeatureSelector: React.FC<Props> = ({ stats, selectedFeature, onSelect }) => {
  // Sort stats by F-Score descending to find the "Best" predictor
  const sortedStats = [...stats].sort((a, b) => b.fScore - a.fScore);
  const bestFeature = sortedStats[0].feature;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        1. Feature Selection Analysis
      </h2>
      <p className="text-gray-600 mb-6">
        The farmer can only afford to measure <strong>one</strong> attribute. Based on our analysis of variance (ANOVA),
        we rank the features by their ability to distinguish between crop types.
      </p>

      <div className="space-y-4">
        {sortedStats.map((stat) => {
          const isBest = stat.feature === bestFeature;
          const isSelected = stat.feature === selectedFeature;

          return (
            <div
              key={stat.feature}
              onClick={() => onSelect(stat.feature)}
              className={`
                relative cursor-pointer border rounded-lg p-4 transition-all duration-200
                ${isSelected ? 'border-green-600 bg-green-50 ring-2 ring-green-200' : 'border-gray-200 hover:border-green-300'}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-green-600' : 'border-gray-400'}`}>
                    {isSelected && <div className="w-3 h-3 bg-green-600 rounded-full" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {stat.feature.replace('_', ' ')}
                      {isBest && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Recommended
                      </span>}
                    </h3>
                    <p className="text-sm text-gray-500">{stat.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">Score: {stat.fScore.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">Est. Accuracy: {(stat.accuracy * 100).toFixed(1)}%</div>
                </div>
              </div>

              {/* Visual Bar for Score */}
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${isBest ? 'bg-green-500' : 'bg-blue-400'}`}
                  style={{ width: `${(stat.fScore / sortedStats[0].fScore) * 100}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureSelector;
