import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import FeatureSelector from './components/FeatureSelector';
import PredictionModel from './components/PredictionModel';
import GeminiAdvisor from './components/GeminiAdvisor';
import FileUpload from './components/FileUpload';
import { getFarmData, parseCSVData } from './services/dataService';
import type { FeatureStats, FarmData } from './type';
import { FeatureType } from './type';
import { analyzeFeatures } from './utils/mlUtils';
import DataAnalysis from './components/DataAnalysis';

const App: React.FC = () => {
  // Default data
  const defaultFarmData = useMemo(() => getFarmData(), []);

  // State for farm data and uploaded data
  const [farmData, setFarmData] = useState<FarmData[]>(defaultFarmData);
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureType[]>([
    FeatureType.PH,
    FeatureType.NITROGEN
  ]);
  const [showAnalysis, setShowAnalysis] = useState(false)

  // Calculate feature stats
  const featureStats: FeatureStats[] = useMemo(() => analyzeFeatures(farmData), [farmData]);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      const parsedData = await parseCSVData(file);
      setFarmData(parsedData);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error parsing CSV file. Please check the format.');
    }
  };

  // Reset to default data
  const handleResetData = () => {
    setFarmData(defaultFarmData);
  };

  // Handle feature selection (multi-select)
  const handleFeatureSelect = (features: FeatureType[]) => {
    setSelectedFeatures(features);
  };

  // Handle feature toggle
  const handleFeatureToggle = (feature: FeatureType) => {
    setSelectedFeatures(prev => {
      if (prev.includes(feature)) {
        return prev.filter(f => f !== feature);
      } else {
        return [...prev, feature];
      }
    });
  };

  const handleShowAnalysis = () => {
    setShowAnalysis(!showAnalysis)
  }


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-900">
      <Header handleShowAnalysis={handleShowAnalysis} />

      {showAnalysis ? <DataAnalysis data={farmData} /> : (

        <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Top Stats Overview */}
          <StatsCards data={farmData} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-8">
              <FeatureSelector
                stats={featureStats}
                selectedFeatures={selectedFeatures}
                onSelect={handleFeatureSelect}
                onFeatureToggle={handleFeatureToggle}
              />

              <PredictionModel
                data={farmData}
                selectedFeatures={selectedFeatures}
              />
            </div>

            {/* Sidebar / Assistant Column */}
            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-24 space-y-6">
                {/* Add File Upload Component */}
                <FileUpload onFileUpload={handleFileUpload} />

                {/* Add Reset Button */}
                <div className="bg-white rounded-xl shadow p-6">
                  <button
                    onClick={handleResetData}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Reset to Default Data
                  </button>
                </div>

                <GeminiAdvisor contextData={featureStats} />

                {/* Selected Features Info */}
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="font-bold text-gray-800 mb-3">Selected Features</h3>
                  <div className="space-y-2">
                    {selectedFeatures.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No features selected</p>
                    ) : (
                      selectedFeatures.map(feature => (
                        <div key={feature} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{feature}</span>
                          <button
                            onClick={() => handleFeatureToggle(feature)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  {selectedFeatures.length > 0 && (
                    <p className="text-xs text-gray-500 mt-3">
                      Using {selectedFeatures.length} feature{selectedFeatures.length > 1 ? 's' : ''} for prediction
                    </p>
                  )}
                </div>

                {/* Additional Info / Context */}
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="font-bold text-gray-800 mb-2">Project Context</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This dashboard simulates a data science pipeline for crop recommendation.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
                    <li><strong>Input:</strong> Raw farm sensor data (CSV).</li>
                    <li><strong>Feature Selection:</strong> Multi-feature Gaussian Naive Bayes classification.</li>
                    <li><strong>Model:</strong> Uses multiple soil attributes for more accurate predictions.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; 2024 AgriPredict. Built for Data Science in Agriculture.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
