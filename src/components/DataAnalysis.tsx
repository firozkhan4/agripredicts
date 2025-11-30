import React, { useMemo, useState } from 'react';
import type { FarmData } from '../type';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, ZAxis, AreaChart, Area
} from 'recharts';
import {
  BarChart3, PieChart as PieChartIcon, TrendingUp, Zap,
  Droplets, Thermometer, Leaf, Database, Filter
} from 'lucide-react';

interface Props {
  data: FarmData[];
}

type ChartView = 'overview' | 'crops' | 'features' | 'correlations';

const DataAnalysis: React.FC<Props> = ({ data }) => {
  const [activeView, setActiveView] = useState<ChartView>('overview');
  const [selectedCrop, setSelectedCrop] = useState<string>('All');

  // Calculate crop distribution
  const cropDistribution = useMemo(() => {
    const cropCounts: Record<string, number> = {};
    data.forEach(farm => {
      cropCounts[farm.cropType] = (cropCounts[farm.cropType] || 0) + 1;
    });

    return Object.entries(cropCounts)
      .map(([crop, count]) => ({
        crop,
        count,
        percentage: (count / data.length) * 100
      }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  // Filter data by selected crop
  const filteredData = useMemo(() => {
    if (selectedCrop === 'All') return data;
    return data.filter(farm => farm.cropType === selectedCrop);
  }, [data, selectedCrop]);

  // Calculate average values by crop
  const cropAverages = useMemo(() => {
    const crops = Array.from(new Set(data.map(d => d.cropType)));
    return crops.map(crop => {
      const cropData = data.filter(d => d.cropType === crop);
      return {
        crop,
        avgPh: cropData.reduce((sum, d) => sum + d.ph, 0) / cropData.length,
        avgNitrogen: cropData.reduce((sum, d) => sum + d.nitrogen, 0) / cropData.length,
        avgPhosphorus: cropData.reduce((sum, d) => sum + d.phosphorus, 0) / cropData.length,
        avgPotassium: cropData.reduce((sum, d) => sum + d.potassium, 0) / cropData.length,
        avgTemperature: cropData.reduce((sum, d) => sum + d.temperature, 0) / cropData.length,
        avgHumidity: cropData.reduce((sum, d) => sum + d.humidity, 0) / cropData.length,
        count: cropData.length
      };
    });
  }, [data]);

  // Feature distributions with better statistics
  const featureStats = useMemo(() => {
    const features = [
      { key: 'ph', name: 'Soil pH', icon: <Zap className="h-4 w-4" />, color: '#8884d8' },
      { key: 'nitrogen', name: 'Nitrogen', icon: <Leaf className="h-4 w-4" />, color: '#82ca9d' },
      { key: 'phosphorus', name: 'Phosphorus', icon: <Zap className="h-4 w-4" />, color: '#ffc658' },
      { key: 'potassium', name: 'Potassium', icon: <Zap className="h-4 w-4" />, color: '#ff7300' },
      { key: 'temperature', name: 'Temperature', icon: <Thermometer className="h-4 w-4" />, color: '#ff3860' },
      { key: 'humidity', name: 'Humidity', icon: <Droplets className="h-4 w-4" />, color: '#0088fe' },
      { key: 'rainfall', name: 'Rainfall', icon: <Droplets className="h-4 w-4" />, color: '#00c49f' }
    ] as const;

    return features.map(feature => {
      const values = data.map(d => d[feature.key as keyof FarmData] as number);
      const sorted = [...values].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];

      return {
        ...feature,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        median: sorted[Math.floor(sorted.length / 2)],
        std: Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - values.reduce((a, b) => a + b, 0) / values.length, 2), 0) / values.length),
        iqr: q3 - q1
      };
    });
  }, [data]);

  // Correlation data for scatter plots
  const correlationData = useMemo(() => {
    return data.map(farm => ({
      crop: farm.cropType,
      nitrogen: farm.nitrogen,
      phosphorus: farm.phosphorus,
      potassium: farm.potassium,
      ph: farm.ph,
      temperature: farm.temperature,
      yield: farm.nitrogen + farm.phosphorus + farm.potassium // Simulated yield
    }));
  }, [data]);

  // Feature trends over time (simulated)
  const timeSeriesData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      month: `Month ${i + 1}`,
      nitrogen: 100 + Math.sin(i) * 30 + Math.random() * 20,
      phosphorus: 50 + Math.cos(i) * 20 + Math.random() * 15,
      potassium: 120 + Math.sin(i + 2) * 25 + Math.random() * 18,
      temperature: 25 + Math.sin(i * 0.5) * 10 + Math.random() * 5
    }));
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'];

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Data Analysis</h2>
        <p className="text-gray-500 text-center py-8">No data available for analysis</p>
      </div>
    );
  }

  const views: { id: ChartView; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Database className="h-4 w-4" /> },
    { id: 'crops', label: 'Crop Analysis', icon: <Leaf className="h-4 w-4" /> },
    { id: 'features', label: 'Features', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'correlations', label: 'Correlations', icon: <TrendingUp className="h-4 w-4" /> },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      {/* Header with Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Dataset Analysis
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Explore patterns and insights from your farm data
          </p>
        </div>

        {/* View Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mt-4 lg:mt-0">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeView === view.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {view.icon}
              <span>{view.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Crop Filter */}
      <div className="flex items-center space-x-4 mb-6">
        <Filter className="h-4 w-4 text-gray-500" />
        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="All">All Crops</option>
          {cropDistribution.map(({ crop }) => (
            <option key={crop} value={crop}>{crop}</option>
          ))}
        </select>
        <span className="text-sm text-gray-500">
          Showing {filteredData.length} of {data.length} records
        </span>
      </div>

      {/* Overview View */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{data.length}</div>
              <div className="text-sm text-blue-700">Total Records</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-600">{cropDistribution.length}</div>
              <div className="text-sm text-green-700">Crop Types</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">7</div>
              <div className="text-sm text-purple-700">Features</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(featureStats.reduce((acc, f) => acc + f.avg, 0) / featureStats.length)}
              </div>
              <div className="text-sm text-orange-700">Avg Feature Value</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Crop Distribution */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                <PieChartIcon className="h-4 w-4 mr-2" />
                Crop Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cropDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {cropDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, _) => [value, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Feature Comparison */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Nutrient Levels by Crop
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cropAverages}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="crop" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgNitrogen" fill="#82ca9d" name="Nitrogen" />
                    <Bar dataKey="avgPhosphorus" fill="#ffc658" name="Phosphorus" />
                    <Bar dataKey="avgPotassium" fill="#ff7300" name="Potassium" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crop Analysis View */}
      {activeView === 'crops' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* pH by Crop */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Soil pH by Crop</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cropAverages}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="crop" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgPh" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Temperature Ranges */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Temperature Preferences</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cropAverages}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="crop" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="avgTemperature" stroke="#ff3860" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features View */}
      {activeView === 'features' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featureStats.map((feature) => (
              <div key={feature.key} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="text-gray-600">{feature.icon}</div>
                  <h3 className="font-medium text-gray-900">{feature.name}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Average:</span>
                    <span className="font-medium">{feature.avg.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Range:</span>
                    <span className="font-medium">{feature.min.toFixed(1)} - {feature.max.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Std Dev:</span>
                    <span className="font-medium">{feature.std.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feature Trends */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Feature Trends Over Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="nitrogen" stackId="1" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="phosphorus" stackId="1" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="potassium" stackId="1" stroke="#ff7300" fill="#ff7300" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Correlations View */}
      {activeView === 'correlations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Nutrients vs pH */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Nutrients vs Soil pH</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={correlationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ph" name="Soil pH" />
                    <YAxis dataKey="nitrogen" name="Nitrogen" />
                    <ZAxis dataKey="yield" range={[50, 500]} name="Yield" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Farms" data={correlationData} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Temperature vs Humidity */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Temperature vs Humidity</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={correlationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="temperature" name="Temperature" />
                    <YAxis dataKey="humidity" name="Humidity" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Farms" data={correlationData} fill="#00c49f" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataAnalysis;
