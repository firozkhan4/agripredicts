import React from 'react';
import type { FarmRecord } from '../type.ts';
import { Database, Wheat, TrendingUp, Droplets } from 'lucide-react';

interface Props {
  data: FarmRecord[];
}

const StatsCards: React.FC<Props> = ({ data }) => {
  const totalFarms = data.length;
  const uniqueCrops = new Set(data.map(d => d.crop_type)).size;
  const avgYield = data.reduce((acc, curr) => acc + curr.yield_kg, 0) / totalFarms;
  const avgMoisture = data.reduce((acc, curr) => acc + curr.soil_moisture, 0) / totalFarms;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Samples</p>
            <p className="text-2xl font-bold text-gray-900">{totalFarms}</p>
          </div>
          <Database className="h-8 w-8 text-blue-100 text-blue-500" />
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
            <p className="text-sm font-medium text-gray-500">Avg. Yield (kg/ha)</p>
            <p className="text-2xl font-bold text-gray-900">{avgYield.toFixed(0)}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-cyan-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Avg. Moisture</p>
            <p className="text-2xl font-bold text-gray-900">{avgMoisture.toFixed(1)}%</p>
          </div>
          <Droplets className="h-8 w-8 text-cyan-500" />
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
