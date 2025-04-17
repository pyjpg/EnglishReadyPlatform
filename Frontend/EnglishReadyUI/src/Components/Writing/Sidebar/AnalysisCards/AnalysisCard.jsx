// src/components/Writing/WritingSidebar/AnalysisCards/AnalysisCard.jsx
import React from 'react';
import PropTypes from 'prop-types';

const AnalysisCard = ({
  title,
  score,
  maxScore = 9.0,
  criteriaType,
  colorClass = 'blue',
  onViewDetails,
  metricsRenderer,
  feedback
}) => {
  const colorVariants = {
    blue: { text: 'text-blue-600', bg: 'bg-blue-500' },
    green: { text: 'text-green-600', bg: 'bg-green-500' },
    purple: { text: 'text-purple-600', bg: 'bg-purple-500' },
    amber: { text: 'text-amber-600', bg: 'bg-amber-500' }
  };

  // Format the score as a decimal (e.g., 4.5/9.0)
  const formatScore = (score) => {
    // Ensure score is a valid number and within range 0-maxScore
    const validScore = Math.min(maxScore, Math.max(0, Number(score) || 0));
    return validScore.toFixed(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-5">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium text-gray-800">{title}</h3>
        {onViewDetails && (
          <button 
            onClick={() => onViewDetails(criteriaType)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            View Details
          </button>
        )}
      </div>
      
      {/* Score Section */}
      <div className="mt-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">{title} Score</span>
          <span className={`text-sm font-medium ${colorVariants[colorClass].text}`}>
            {formatScore(score)}/{maxScore.toFixed(1)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div 
            className={`${colorVariants[colorClass].bg} rounded-full h-2`} 
            style={{ width: `${(score / maxScore) * 100}%` }}
          />
        </div>
      </div>

      {/* Custom Metrics Section */}
      {metricsRenderer && metricsRenderer}

      {/* Feedback Section */}
      {feedback && (
        <div className="mt-3">
          <h4 className="text-xs font-medium text-gray-700">Feedback</h4>
          <p className="text-sm text-gray-600 mt-1">
            {Array.isArray(feedback)
              ? feedback[0]
              : typeof feedback === 'string'
                ? feedback
                : 'No specific feedback available'}
          </p>
        </div>
      )}
    </div>
  );
};

AnalysisCard.propTypes = {
  title: PropTypes.string.isRequired,
  score: PropTypes.number.isRequired,
  maxScore: PropTypes.number,
  criteriaType: PropTypes.string,
  colorClass: PropTypes.oneOf(['blue', 'green', 'purple', 'amber']),
  onViewDetails: PropTypes.func,
  metricsRenderer: PropTypes.node,
  feedback: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ])
};

export default AnalysisCard;