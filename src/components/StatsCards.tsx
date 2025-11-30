import React from 'react';
import type { FarmData } from '../type.ts';
import { Database, Wheat, TrendingUp, Droplets, Thermometer, Leaf } from 'lucide-react';

interface Props {
  data: FarmData[];
}

const StatsCards: React.FC<Props> = ({ data }) => {
  const totalFarms = data.length;
  const uniqueCrops = new Set(data.map(d => d.cropType)).size;

  // Calculate average values for relevant metrics
  const avgPh = data.reduce((acc, curr) => acc + curr.ph, 0) / totalFarms;
  const avgNitrogen = data.reduce((acc, curr) => acc + curr.nitrogen, 0) / totalFarms;
  const avgTemperature = data.reduce((acc, curr) => acc + curr.temperature, 0) / totalFarms;
  const avgHumidity = data.reduce((acc, curr) => acc + curr.humidity, 0) / totalFarms;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Samples</p>
            <p className="text-2xl font-bold text-gray-900">{totalFarms}</p>
          </div>
          <Database className="h-8 w-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Crop Varieties</p>
            <p className="text-2xl font-bold text-gray-900">{uniqueCrops}</p>
          </div>
          <Wheat className="h-8 w-8 text-yellow-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Avg. pH Level</p>
            <p className="text-2xl font-bold text-gray-900">{avgPh.toFixed(1)}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-cyan-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Avg. Humidity</p>
            <p className="text-2xl font-bold text-gray-900">{avgHumidity.toFixed(1)}%</p>
          </div>
          <Droplets className="h-8 w-8 text-cyan-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Avg. Nitrogen</p>
            <p className="text-2xl font-bold text-gray-900">{avgNitrogen.toFixed(1)}</p>
          </div>
          <Leaf className="h-8 w-8 text-purple-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Avg. Temperature</p>
            <p className="text-2xl font-bold text-gray-900">{avgTemperature.toFixed(1)}°C</p>
          </div>
          <Thermometer className="h-8 w-8 text-red-500" />
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
