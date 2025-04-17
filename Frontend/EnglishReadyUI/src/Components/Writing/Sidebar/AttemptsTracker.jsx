import React from 'react';
import PropTypes from 'prop-types';

const AttemptsTracker = ({ 
  attemptsRemaining, 
  maxAttempts = 3, 
  showText = false 
}) => {
  const getTextColorClass = () => {
    if (attemptsRemaining === 0) return 'text-red-500';
    if (attemptsRemaining === 1) return 'text-orange-500';
    return 'text-blue-600';
  };

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: maxAttempts }).map((_, i) => (
        <div 
          key={i}
          className={`w-3 h-3 rounded-full transition-all ${
            i < attemptsRemaining
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm scale-100'
              : 'bg-gray-200 scale-90 opacity-40'
          }`}
        />
      ))}
      
      {showText && (
        <span className={`ml-2 text-sm font-medium ${getTextColorClass()}`}>
          {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
        </span>
      )}
    </div>
  );
};

AttemptsTracker.propTypes = {
  attemptsRemaining: PropTypes.number.isRequired,
  maxAttempts: PropTypes.number,
  showText: PropTypes.bool
};

export default AttemptsTracker;