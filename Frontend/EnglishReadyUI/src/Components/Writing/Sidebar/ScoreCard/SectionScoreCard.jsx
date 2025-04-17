import React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from './CircularProgress';


const SectionScoreCard = ({ selectedSection, sectionScores, sectionAttempts, feedbackData }) => {
  if (!selectedSection) return null;
  
 
  const sectionScore = sectionScores[selectedSection]?.score || 0;
  
  const sectionDisplayName = selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1);
  
  console.log("SectionScoreCard received feedbackData:", feedbackData);
  console.log("Section score for", selectedSection, ":", sectionScore);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-5">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium text-gray-800">Current Section: {sectionDisplayName}</h3>
      </div>
      
      <div className="mt-3 flex flex-col items-center">
        <div className="h-24 w-24 mb-2">
          <CircularProgress percentage={sectionScore} />
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Attempts remaining</span>
          <div className="flex items-center space-x-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < sectionAttempts[selectedSection]
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm scale-100'
                    : 'bg-gray-200 scale-90 opacity-40'
                }`}
              />
            ))}
            <span className={`ml-2 text-sm font-medium ${
              sectionAttempts[selectedSection] === 0 
                ? 'text-red-500' 
                : sectionAttempts[selectedSection] === 1
                  ? 'text-orange-500'
                  : 'text-blue-600'
            }`}>
              {sectionAttempts[selectedSection]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

SectionScoreCard.propTypes = {
  selectedSection: PropTypes.string.isRequired,
  sectionScores: PropTypes.object.isRequired,
  sectionAttempts: PropTypes.object.isRequired,
  sectionsData: PropTypes.object.isRequired,
  feedbackData: PropTypes.object
};

export default SectionScoreCard;