// src/components/Writing/WritingSidebar/SubmitButton.jsx
import React from 'react';
import PropTypes from 'prop-types';
import AttemptsTracker from './AttemptsTracker';

const SubmitButton = ({
  isSubmitting,
  attemptsRemaining,
  onSubmit,
  selectedSection,
  disabled = false
}) => {
  // Determine button state and text based on attempts and submission status
  const getButtonState = () => {
    if (isSubmitting) {
      return {
        text: 'Submitting...',
        disabled: true,
        className: 'bg-blue-600 opacity-50'
      };
    }
    
    if (attemptsRemaining <= 0) {
      return {
        text: 'No attempts left',
        disabled: true,
        className: 'bg-gray-400 cursor-not-allowed'
      };
    }
    
    if (disabled) {
      return {
        text: `Submit ${selectedSection}`,
        disabled: true,
        className: 'bg-blue-600 opacity-50'
      };
    }
    
    return {
      text: `Submit ${selectedSection}`,
      disabled: false,
      className: 'bg-blue-600 hover:bg-blue-700'
    };
  };
  
  const buttonState = getButtonState();
  
  return (
    <div className="mt-auto space-y-2">
      {/* Attempts indicator */}
      <div className="flex items-center justify-center mb-2 py-2 bg-white rounded-lg shadow-sm">
        <AttemptsTracker 
          attemptsRemaining={attemptsRemaining} 
          maxAttempts={3}
          showText={true}
        />
      </div>
      
      <button
        onClick={onSubmit}
        disabled={buttonState.disabled}
        className={`w-full px-6 py-2 ${buttonState.className} text-white rounded-lg transition-colors`}
      >
        {buttonState.text}
      </button>
    </div>
  );
};

SubmitButton.propTypes = {
  isSubmitting: PropTypes.bool.isRequired,
  attemptsRemaining: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired,
  selectedSection: PropTypes.string.isRequired,
  disabled: PropTypes.bool
};

export default SubmitButton;