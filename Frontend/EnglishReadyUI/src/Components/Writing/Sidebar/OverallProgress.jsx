// src/components/Writing/WritingSidebar/OverallProgress.jsx
import React from 'react';
import PropTypes from 'prop-types';

const OverallProgress = ({ sectionsData }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-5">
      <h3 className="text-base font-medium text-gray-800">Overall Progress</h3>
      <div className="mt-2">
        {Object.keys(sectionsData).map(section => {
          // Assuming the grade is already on a 0-100 scale
          const score = sectionsData[section]?.grade || 0;
          // Use the score directly as percentage (assuming it's already 0-100)
          const percentage = Math.min(100, Math.round(score));
          
          return (
            <div key={section} className="mb-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 capitalize">{section}</span>
                <span className="text-sm font-medium text-blue-600">
                  {score.toFixed(1)}/100.0
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-500 rounded-full h-2" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

OverallProgress.propTypes = {
  sectionsData: PropTypes.object.isRequired
};

export default OverallProgress;