import React, { useState, useEffect, useCallback } from 'react';
import type { FarmData, PredictionResult } from '../type.ts';
import { predictCropMultiFeature } from '../utils/mlUtils';
import { FeatureType } from '../type.ts';
import { ArrowRight, Activity, Leaf, Loader, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  data: FarmData[];
  selectedFeatures: FeatureType[];
}

const PredictionModel: React.FC<Props> = ({ data, selectedFeatures }) => {
  const [inputValues, setInputValues] = useState<Record<FeatureType, number>>({} as Record<FeatureType, number>);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inputErrors, setInputErrors] = useState<Record<FeatureType, string>>({} as Record<FeatureType, string>);

  // Get feature display name and units
  const getFeatureConfig = (feature: FeatureType) => {
    const config = {
      [FeatureType.PH]: { label: 'Soil pH', unit: '', min: 0, max: 14, step: 0.1 },
      [FeatureType.NITROGEN]: { label: 'Nitrogen Level', unit: 'ppm', min: 0, max: 200, step: 1 },
      [FeatureType.PHOSPHORUS]: { label: 'Phosphorus Level', unit: 'ppm', min: 0, max: 100, step: 1 },
      [FeatureType.POTASSIUM]: { label: 'Potassium Level', unit: 'ppm', min: 0, max: 200, step: 1 },
      [FeatureType.TEMPERATURE]: { label: 'Temperature', unit: '°C', min: -10, max: 50, step: 0.1 },
      [FeatureType.HUMIDITY]: { label: 'Humidity', unit: '%', min: 0, max: 100, step: 0.1 },
      [FeatureType.RAINFALL]: { label: 'Rainfall', unit: 'mm', min: 0, max: 1000, step: 1 },
    };
    return config[feature] || { label: feature, unit: '', min: 0, max: 100, step: 0.1 };
  };

  // Validate input value for a specific feature
  const validateInput = (feature: FeatureType, value: number): boolean => {
    const featureConfig = getFeatureConfig(feature);
    const errors = { ...inputErrors };

    if (isNaN(value)) {
      errors[feature] = 'Please enter a valid number';
      setInputErrors(errors);
      return false;
    }
    if (value < featureConfig.min || value > featureConfig.max) {
      errors[feature] = `Value must be between ${featureConfig.min} and ${featureConfig.max}`;
      setInputErrors(errors);
      return false;
    }

    errors[feature] = '';
    setInputErrors(errors);
    return true;
  };

  // Validate all inputs
  const validateAllInputs = (): boolean => {
    if (selectedFeatures.length === 0) return false;

    let isValid = true;
    selectedFeatures.forEach(feature => {
      if (!validateInput(feature, inputValues[feature])) {
        isValid = false;
      }
    });
    return isValid;
  };

  // Set reasonable default values when features change
  useEffect(() => {
    if (data.length === 0 || selectedFeatures.length === 0) {
      setInputValues({} as Record<FeatureType, number>);
      setError(selectedFeatures.length === 0 ? 'Please select at least one feature' : 'No data available for prediction');
      return;
    }

    try {
      const newInputValues: Record<FeatureType, number> = {} as Record<FeatureType, number>;

      selectedFeatures.forEach(feature => {
        const values = data.map(d => {
          switch (feature) {
            case FeatureType.PH: return d.ph;
            case FeatureType.NITROGEN: return d.nitrogen;
            case FeatureType.PHOSPHORUS: return d.phosphorus;
            case FeatureType.POTASSIUM: return d.potassium;
            case FeatureType.TEMPERATURE: return d.temperature;
            case FeatureType.HUMIDITY: return d.humidity;
            case FeatureType.RAINFALL: return d.rainfall;
            default: return 0;
          }
        }).filter(val => !isNaN(val));

        if (values.length === 0) {
          throw new Error(`No valid data found for ${getFeatureConfig(feature).label}`);
        }

        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        newInputValues[feature] = parseFloat(avg.toFixed(2));
      });

      setInputValues(newInputValues);
      setError(null);
      setInputErrors({} as Record<FeatureType, string>);
      setResult(null);
    } catch (err) {
      setError('Error processing farm data');
      console.error('Error processing data:', err);
    }
  }, [selectedFeatures, data]);

  const handlePredict = useCallback(async () => {
    if (!validateAllInputs() || data.length === 0 || selectedFeatures.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      const res = predictCropMultiFeature(data, selectedFeatures, inputValues);

      if (!res || !res.predictedCrop) {
        throw new Error('Invalid prediction result');
      }

      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed. Please try again.');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [data, selectedFeatures, inputValues]);

  // Handle input change for a specific feature
  const handleInputChange = (feature: FeatureType, value: string) => {
    const numValue = parseFloat(value);
    setInputValues(prev => ({
      ...prev,
      [feature]: numValue
    }));
    validateInput(feature, numValue);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handlePredict();
    }
  };

  const chartData = result
    ? Object.entries(result.probabilities)
      .map(([name, prob]) => ({
        name,
        probability: prob * 100,
        isTop: false
      }))
      .sort((a, b) => b.probability - a.probability)
      .map((item, index) => ({
        ...item,
        isTop: index === 0
      }))
      .slice(0, 5)
    : [];

  const getConfidenceColor = (confidence: number): string => {
    if (confidence > 0.8) return 'text-green-600';
    if (confidence > 0.6) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getConfidenceLevel = (confidence: number): string => {
    if (confidence > 0.8) return 'High';
    if (confidence > 0.6) return 'Medium';
    return 'Low';
  };

  if (selectedFeatures.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Features Selected</h3>
          <p className="text-gray-500">Please select at least one feature to make predictions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-green-600" />
          Multi-Feature Prediction Classifier
        </h2>
        <div className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
          {selectedFeatures.length} Feature{selectedFeatures.length > 1 ? 's' : ''} Selected
        </div>
      </div>

      <p className="text-gray-600 mb-6">
        Using a Gaussian Naive Bayes classifier trained on your farm's data with{' '}
        <strong>{selectedFeatures.length} selected feature{selectedFeatures.length > 1 ? 's' : ''}</strong>.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Input Section */}
        <div className="flex-1 space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Feature Values</h3>

            <div className="space-y-4">
              {selectedFeatures.map((feature, index) => {
                const featureConfig = getFeatureConfig(feature);
                const error = inputErrors[feature];

                return (
                  <div key={feature} className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mt-1 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {featureConfig.label} {featureConfig.unit && `(${featureConfig.unit})`}
                      </label>
                      <input
                        type="number"
                        value={inputValues[feature] || ''}
                        onChange={(e) => handleInputChange(feature, e.target.value)}
                        onKeyPress={handleKeyPress}
                        min={featureConfig.min}
                        max={featureConfig.max}
                        step={featureConfig.step}
                        className={`block w-full rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm p-3 border ${error ? 'border-red-300' : 'border-gray-300'
                          }`}
                        disabled={isLoading || data.length === 0}
                        placeholder={`Enter ${featureConfig.label.toLowerCase()}`}
                      />
                      {error && (
                        <p className="mt-1 text-sm text-red-600">{error}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Range: {featureConfig.min} - {featureConfig.max} {featureConfig.unit}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handlePredict}
                disabled={isLoading || data.length === 0 || Object.values(inputErrors).some(err => err)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Predicting...
                  </>
                ) : (
                  <>
                    Predict <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {result && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 text-center animate-fade-in">
              <p className="text-sm text-green-600 font-semibold uppercase tracking-wide mb-2">
                Recommended Crop
              </p>
              <div className="flex items-center justify-center space-x-3 mb-3">
                <Leaf className="h-10 w-10 text-green-600" />
                <h3 className="text-4xl font-extrabold text-green-800">
                  {result.predictedCrop}
                </h3>
              </div>
              <div className="flex items-center justify-center space-x-4 text-sm">
                <span className={`font-semibold ${getConfidenceColor(result.confidence)}`}>
                  Confidence: {(result.confidence * 100).toFixed(1)}%
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">
                  {getConfidenceLevel(result.confidence)} confidence
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                Based on {selectedFeatures.length} feature{selectedFeatures.length > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Visualization Section */}
        {/* Visualization Section */}
        <div className="flex-1 border border-gray-200 rounded-lg p-4 relative bg-white">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Probability Distribution</h3>
          {result ? (
            <div className="w-full h-64 lg:h-72 min-h-0"> {/* Added min-h-0 */}
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={80}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Probability']}
                    labelFormatter={(label) => `Crop: ${label}`}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar dataKey="probability" radius={[0, 4, 4, 0]} barSize={24}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isTop ? '#16a34a' : '#94a3b8'}
                        opacity={entry.isTop ? 1 : 0.7}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-64 lg:h-72 text-gray-400 min-h-0">
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-gray-500">Run a prediction to see crop probabilities</p>
                <p className="text-sm text-gray-400 mt-1">
                  The chart will show top 5 recommended crops
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionModel;
