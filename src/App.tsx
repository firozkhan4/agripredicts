import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import FeatureSelector from './components/FeatureSelector';
import PredictionModel from './components/PredictionModel';
import GeminiAdvisor from './components/GeminiAdvisor';
import FileUpload from './components/FileUpload';
import { getFarmData, parseCSVData } from './services/dataService';
import type { FeatureStats, FarmData } from './type';
import { FeatureType } from './type'; // This should work with your current type definition
import { analyzeFeatures } from './utils/mlUtils';

const App: React.FC = () => {
  // Default data
  const defaultFarmData = useMemo(() => getFarmData(), []);

  // State for farm data and uploaded data
  const [farmData, setFarmData] = useState<FarmData[]>(defaultFarmData);
  const [selectedFeature, setSelectedFeature] = useState<FeatureType>(FeatureType.PH);

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-900">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Stats Overview */}
        <StatsCards data={farmData} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            <FeatureSelector
              stats={featureStats}
              selectedFeature={selectedFeature}
              onSelect={setSelectedFeature}
            />

            <PredictionModel
              data={farmData}
              selectedFeature={selectedFeature}
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

              {/* Additional Info / Context */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-gray-800 mb-2">Project Context</h3>
                <p className="text-sm text-gray-600 mb-4">
                  This dashboard simulates a data science pipeline for crop recommendation.
                </p>
                <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
                  <li><strong>Input:</strong> Raw farm sensor data (CSV).</li>
                  <li><strong>Feature Selection:</strong> Calculates variance ratios to find the single most predictive soil attribute.</li>
                  <li><strong>Model:</strong> Uses Gaussian Naive Bayes classification to predict crop types based on the selected single feature.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; 2024 AgriPredict. Built for Data Science in Agriculture.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
