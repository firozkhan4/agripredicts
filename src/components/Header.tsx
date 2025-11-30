import React from 'react';
import { Sprout } from 'lucide-react';


interface Props {
  handleShowAnalysis: () => void
}


const Header: React.FC<Props> = ({ handleShowAnalysis }) => {
  return (
    <header className="bg-green-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Sprout className="h-8 w-8 text-green-300" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AgriPredict</h1>
            <p className="text-xs text-green-200 uppercase tracking-wider font-semibold">AI-Powered Crop Recommendation</p>
          </div>
        </div>
        <div className="hidden md:block text-sm text-green-100 italic">
          Optimizing Agriculture with Data Science
        </div>
        <button
          onClick={handleShowAnalysis}
        >
          Analysis
        </button>
      </div>
    </header>
  );
};

export default Header;
