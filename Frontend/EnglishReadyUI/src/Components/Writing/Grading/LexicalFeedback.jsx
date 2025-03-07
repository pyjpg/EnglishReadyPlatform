import React from 'react';
import PropTypes from 'prop-types';

const LexicalFeedback = ({ feedback }) => {
  const renderSuggestions = (suggestions) => {
    // If suggestions is an object with linking_phrases
    if (suggestions.linking_phrases) {
      return (
        <div className="space-y-2">
          {Object.entries(suggestions.linking_phrases).map(([category, phrases]) => (
            <div key={category} className="text-xs">
              <span className="text-blue-700 font-medium capitalize">{category.replace('_', ' ')}: </span>
              <span className="text-blue-600">{phrases.join(', ')}</span>
            </div>
          ))}
        </div>
      );
    }
    
    // If suggestions is a regular word:alternatives mapping
    if (typeof suggestions === 'object') {
      return Object.entries(suggestions).map(([word, alternatives], index) => (
        <div key={index} className="flex items-center gap-1 text-xs">
          <span className="text-blue-700">{word}:</span>
          <span className="text-blue-600">
            {Array.isArray(alternatives) ? alternatives.join(', ') : alternatives}
          </span>
        </div>
      ));
    }

    return null;
  };

  return (
    <div className="space-y-4">
      {/* General Feedback */}
      {feedback.general_feedback?.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h6 className="text-sm font-medium text-gray-700 mb-2">Overall Analysis</h6>
          <div className="space-y-2">
            {feedback.general_feedback.map((item, index) => (
              <p key={index} className="text-sm text-gray-600">{item}</p>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {feedback.strengths?.length > 0 && (
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <h6 className="text-sm font-medium text-green-700 mb-2">Your Strengths</h6>
          <ul className="space-y-1">
            {feedback.strengths.map((strength, index) => (
              <li key={index} className="text-sm text-green-600 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {feedback.improvements?.length > 0 && (
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
          <h6 className="text-sm font-medium text-yellow-700 mb-2">Areas for Improvement</h6>
          <ul className="space-y-1">
            {feedback.improvements.map((improvement, index) => (
              <li key={index} className="text-sm text-yellow-600 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {improvement}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Suggestions */}
      {feedback.detailed_suggestions && Object.entries(feedback.detailed_suggestions).map(([key, suggestion]) => (
        <div key={key} className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h6 className="text-sm font-medium text-blue-700 mb-2">{suggestion.issue}</h6>
          
          {/* Examples */}
          {suggestion.examples?.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-blue-600 mb-1">Examples found in your text:</p>
              <div className="flex flex-wrap gap-2">
                {suggestion.examples.map((example, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    {example}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestion.suggestions && (
            <div>
              <p className="text-xs text-blue-600 mb-1">Suggested alternatives:</p>
              <div className="flex flex-wrap gap-2">
                {renderSuggestions(suggestion.suggestions)}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

LexicalFeedback.propTypes = {
  feedback: PropTypes.shape({
    general_feedback: PropTypes.arrayOf(PropTypes.string),
    strengths: PropTypes.arrayOf(PropTypes.string),
    improvements: PropTypes.arrayOf(PropTypes.string),
    detailed_suggestions: PropTypes.objectOf(PropTypes.shape({
      issue: PropTypes.string.isRequired,
      examples: PropTypes.arrayOf(PropTypes.string),
      suggestions: PropTypes.oneOfType([
        PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
        PropTypes.shape({
          linking_phrases: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string))
        })
      ])
    }))
  }).isRequired
};

export default LexicalFeedback;