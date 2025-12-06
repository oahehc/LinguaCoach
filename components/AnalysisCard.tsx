import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { CheckCircle, AlertTriangle, Lightbulb, Activity, Mic, Volume2, Loader2 } from 'lucide-react';
import { playTextAsSpeech } from '../services/geminiService';

interface AnalysisCardProps {
  analysis: AnalysisResult;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ analysis }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const isPerfect = analysis.naturalnessScore >= 95;
  const scoreColor = 
    analysis.naturalnessScore >= 80 ? 'text-emerald-600' :
    analysis.naturalnessScore >= 50 ? 'text-amber-600' : 
    'text-red-600';

  const scoreBg = 
    analysis.naturalnessScore >= 80 ? 'bg-emerald-100' :
    analysis.naturalnessScore >= 50 ? 'bg-amber-100' : 
    'bg-red-100';

  const handlePlay = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      await playTextAsSpeech(analysis.correctedText);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden w-full max-w-2xl mt-4">
      {/* Header / Score */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
             <Activity size={20} />
           </div>
           <span className="font-semibold text-slate-700">Coach Feedback</span>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${scoreBg} ${scoreColor} text-sm font-bold`}>
           <span>Naturalness: {analysis.naturalnessScore}/100</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Correction Section */}
        <div>
           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Better way to say it</h4>
           <div className="flex items-start gap-3">
             <CheckCircle className="text-emerald-500 mt-1 shrink-0" size={20} />
             <div className="flex-1">
                 <p className="text-lg text-slate-800 font-medium">
                   {analysis.correctedText}
                 </p>
                 <button 
                    onClick={handlePlay} 
                    disabled={isPlaying}
                    className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-wait"
                 >
                    {isPlaying ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
                    {isPlaying ? "Playing..." : "Hear pronunciation"}
                 </button>
             </div>
           </div>
        </div>

        {/* Explanation Section */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
           <div className="flex items-start gap-3">
              <Lightbulb className="text-amber-500 mt-1 shrink-0" size={20} />
              <div>
                <h5 className="font-semibold text-slate-700 mb-1">Why?</h5>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {analysis.explanation}
                </p>
              </div>
           </div>
        </div>

        {/* Issues & Pronunciation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Grammar Issues */}
            {analysis.grammarIssues.length > 0 && (
              <div className="border border-red-100 bg-red-50/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2 text-red-700 font-semibold">
                  <AlertTriangle size={16} />
                  <span>Key Issues</span>
                </div>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                  {analysis.grammarIssues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

             {/* Pronunciation Feedback (Optional) */}
             {analysis.pronunciationFeedback && (
               <div className="border border-purple-100 bg-purple-50/50 rounded-xl p-4">
                 <div className="flex items-center gap-2 mb-2 text-purple-700 font-semibold">
                   <Mic size={16} />
                   <span>Pronunciation</span>
                 </div>
                 <p className="text-sm text-slate-600">
                   {analysis.pronunciationFeedback}
                 </p>
               </div>
             )}
        </div>

        {/* Alternatives */}
        {analysis.betterAlternatives.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Other Natural Alternatives</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.betterAlternatives.map((alt, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-sm rounded-lg shadow-sm">
                  "{alt}"
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisCard;
