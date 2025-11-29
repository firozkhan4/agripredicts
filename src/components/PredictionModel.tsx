import React, { useState, useEffect } from 'react';
import type { FarmRecord, PredictionResult } from '../type.ts';
import { predictCrop } from '../utils/mlUtils';
import { FeatureType } from '../type.ts';
import { ArrowRight, Activity, Leaf } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  data: FarmRecord[];
  selectedFeature: FeatureType;
}

const PredictionModel: React.FC<Props> = ({ data, selectedFeature }) => {
  const [inputValue, setInputValue] = useState<number>(0);
  const [result, setResult] = useState<PredictionResult | null>(null);

  // Set a reasonable default value when feature changes
  useEffect(() => {
    const values = data.map(d => d[selectedFeature === FeatureType.PH ? 'soil_pH' : selectedFeature === FeatureType.MOISTURE ? 'soil_moisture' : selectedFeature]);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    setInputValue(parseFloat(avg.toFixed(2)));
    setResult(null);
  }, [selectedFeature, data]);

  const handlePredict = () => {
    const res = predictCrop(data, selectedFeature, inputValue);
    setResult(res);
  };

  const chartData = result
    ? Object.entries(result.probabilities)
      .map(([name, prob]) => ({ name, probability: prob * 100 }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5) // Top 5
    : [];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        2. Live Prediction Classifier
      </h2>
      <p className="text-gray-600 mb-6">
        Using a Gaussian Naive Bayes classifier trained on the <strong>{selectedFeature}</strong> data.
      </p>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Input Section */}
        <div className="flex-1 space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
              Enter {selectedFeature.replace('_', ' ')} Value
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(parseFloat(e.target.value))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-3 border"
                step="0.1"
              />
              <button
                onClick={handlePredict}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Predict <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Change the value to see how the recommendation model reacts in real-time.
            </p>
          </div>

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center animate-fade-in">
              <p className="text-sm text-green-600 font-semibold uppercase tracking-wide">Recommended Crop</p>
              <div className="flex items-center justify-center mt-2 space-x-2">
                <Leaf className="h-8 w-8 text-green-600" />
                <h3 className="text-4xl font-extrabold text-green-800">{result.predictedCrop}</h3>
              </div>
              <p className="mt-2 text-green-700">
                Confidence: {(result.confidence * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        {/* Visualization Section */}
        <div className="flex-1 h-64 md:h-auto min-h-[300px] border rounded-lg p-4 relative">
          <h3 className="text-sm font-medium text-gray-500 absolute top-4 left-4">Probability Distribution</h3>
          {result ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 40, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey="probability" radius={[0, 4, 4, 0]} barSize={20}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#16a34a' : '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Activity className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Run a prediction to see probabilities</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionModel;
