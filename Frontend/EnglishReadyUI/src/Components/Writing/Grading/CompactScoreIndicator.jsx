import React from 'react';
import PropTypes from 'prop-types';

const CompactScoreIndicator = ({ score, maxScore, label, onClick, tooltip }) => {
  const percentage = (score / maxScore) * 100;
  
  const getColor = () => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="mb-2 group relative">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <div className="flex items-center">
          <span className="font-medium text-sm">
            {score.toFixed(1)}/{maxScore}
          </span>
          {tooltip && (
            <div className="ml-1 relative">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
                {tooltip}
              </div>
            </div>
          )}
        </div>
      </div>
      <div 
        className="w-full bg-gray-200 rounded-full h-1.5 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onClick}
      >
        <div className={`${getColor()} h-1.5 rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

CompactScoreIndicator.propTypes = {
  score: PropTypes.number.isRequired,
  maxScore: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  tooltip: PropTypes.string
};

export default CompactScoreIndicator;