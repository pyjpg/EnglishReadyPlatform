import React from 'react';
import PropTypes from 'prop-types';

const GrammarAnalysis = ({ 
  grammarAnalysis, 
  isExpanded, 
  onToggleSection, 
  onViewDetails 
}) => {
  if (!grammarAnalysis || !grammarAnalysis.overall_score) return null;
  
  // Format the score as a decimal (4.5/9.0)
  const formatScore = (score) => {
    // Ensure score is a valid number and within range 0-9
    const validScore = Math.min(9, Math.max(0, Number(score) || 0));
    return validScore.toFixed(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-5">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium text-gray-800">Grammar & Sentence Structure</h3>
        <div className="flex space-x-3">
          <button 
            onClick={() => onToggleSection('grammar')}
            className="text-xs text-gray-600 hover:text-gray-800"
          >
            {isExpanded ? "Hide Analysis" : "Show Analysis"}
          </button>
          <button 
            onClick={() => onViewDetails('grammar')}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            View Details
          </button>
        </div>
      </div>
      
      {/* Score Section */}
      <div className="mt-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Grammar Score</span>
          <span className="text-sm font-medium text-green-600">
            {formatScore(grammarAnalysis.overall_score)}/9.0
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div 
            className="bg-green-500 rounded-full h-2" 
            style={{ width: `${(grammarAnalysis.overall_score / 9) * 100}%` }}
          />
        </div>
      </div>

      {/* Feedback Section */}
      {grammarAnalysis.feedback && (
        <div className="mt-3">
          <h4 className="text-xs font-medium text-gray-700">Feedback</h4>
          <p className="text-sm text-gray-600 mt-1">
            {typeof grammarAnalysis.feedback === 'string'
              ? grammarAnalysis.feedback
              : 'No specific feedback available'}
          </p>
        </div>
      )}
      
      {/* Condensed Sentence Analysis (Only shown when expanded) */}
      {isExpanded && grammarAnalysis.sentence_analysis && grammarAnalysis.sentence_analysis.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-medium text-gray-700">Sentence Quality</h4>
          <div className="bg-gray-50 p-3 rounded-lg mt-2">
            <div className="space-y-2">
              {grammarAnalysis.sentence_analysis.map((sentence, index) => (
                <div key={`sentence-${index}`} className="flex items-center">
                  <span className="text-xs w-20 text-gray-600">Sentence {index + 1}:</span>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-green-500 rounded-full h-1.5" 
                        style={{ width: `${sentence.score || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs ml-2 text-gray-600">{sentence.score ? `${Math.round(sentence.score)}%` : 'N/A'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

GrammarAnalysis.propTypes = {
  grammarAnalysis: PropTypes.object.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  onToggleSection: PropTypes.func.isRequired,
  onViewDetails: PropTypes.func.isRequired
};

export default GrammarAnalysis;