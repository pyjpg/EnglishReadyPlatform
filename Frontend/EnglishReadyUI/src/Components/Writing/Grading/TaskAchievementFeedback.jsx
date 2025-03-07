import React from 'react';
import PropTypes from 'prop-types';

const TaskAchievementFeedback = ({ feedback }) => {
  if (!feedback) return null;

  return (
    <div className="space-y-4">
      {/* Strengths Section */}
      {feedback.strengths && feedback.strengths.length > 0 && (
        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
          <h6 className="font-medium text-sm text-green-700 mb-2">Strengths</h6>
          <ul className="list-disc pl-5 text-sm text-green-700 space-y-1">
            {feedback.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements Section */}
      {feedback.improvements && feedback.improvements.length > 0 && (
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
          <h6 className="font-medium text-sm text-amber-700 mb-2">Areas for Improvement</h6>
          <ul className="list-disc pl-5 text-sm text-amber-700 space-y-1">
            {feedback.improvements.map((improvement, index) => (
              <li key={index}>{improvement}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Specific Suggestions */}
      {feedback.specific_suggestions && Object.keys(feedback.specific_suggestions).length > 0 && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
          <h6 className="font-medium text-sm text-blue-700 mb-2">Specific Suggestions</h6>
          
          {Object.entries(feedback.specific_suggestions).map(([category, suggestions]) => (
            suggestions.length > 0 && (
              <div key={category} className="mb-3">
                <h6 className="text-xs font-medium text-blue-600 uppercase mb-1">
                  {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </h6>
                <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

TaskAchievementFeedback.propTypes = {
  feedback: PropTypes.shape({
    strengths: PropTypes.arrayOf(PropTypes.string),
    improvements: PropTypes.arrayOf(PropTypes.string),
    specific_suggestions: PropTypes.objectOf(
      PropTypes.arrayOf(PropTypes.string)
    )
  })
};

export default TaskAchievementFeedback;