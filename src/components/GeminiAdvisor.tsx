import React, { useState } from 'react';
import { getAgriculturalInsight } from '../services/geminiService';
import type { FeatureStats } from '../type.ts';
import { Bot, Send, Loader2 } from 'lucide-react';

interface Props {
  contextData: FeatureStats[];
}

const GeminiAdvisor: React.FC<Props> = ({ contextData }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    // Prepare a summarized context string
    const contextString = `
      The dataset contains farming data. 
      We analyzed 5 features to predict crop type. 
      The ranking of features by importance (F-Score) is:
      ${contextData.map(s => `- ${s.feature}: Score ${s.fScore.toFixed(2)}`).join('\n')}
    `;

    const response = await getAgriculturalInsight(question, contextString);
    setAnswer(response);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
      <div className="flex items-center space-x-3 mb-4">
        <Bot className="h-6 w-6 text-white" />
        <h2 className="text-xl font-bold">Ask AI Agricultural Advisor</h2>
      </div>

      <p className="text-indigo-100 mb-6 text-sm">
        Need help interpreting the data or understanding why specific soil attributes matter? Ask Gemini.
      </p>

      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4 min-h-[100px] border border-white/20">
        {loading ? (
          <div className="flex items-center justify-center h-full text-indigo-100">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Analyzing data...
          </div>
        ) : answer ? (
          <div className="prose prose-invert prose-sm max-w-none">
            {answer.split('\n').map((line, i) => <p key={i}>{line}</p>)}
          </div>
        ) : (
          <p className="text-indigo-200 italic">Your answer will appear here...</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="e.g., Why is soil pH the most important factor?"
          className="flex-1 bg-white text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          className="bg-indigo-800 hover:bg-indigo-900 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default GeminiAdvisor;
