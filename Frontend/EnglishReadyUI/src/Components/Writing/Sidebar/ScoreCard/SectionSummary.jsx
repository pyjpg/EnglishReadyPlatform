import React from 'react';
import PropTypes from 'prop-types';

const SectionSummary = ({ selectedSection, customTitle, customGuideline }) => {

  const sectionNames = {
    introduction: "Introduction",
    analysis: "Analysis & Main Body",
    conclusion: "Conclusion"
  };
  
  const sectionGuidelines = {
    introduction: "A strong introduction should paraphrase the question and provide a general overview without specific data.",
    analysis: "The main body should analyze key features of the data and make relevant comparisons.",
    conclusion: "The conclusion should summarize the main trends without introducing new data."
  };

  const title = customTitle || (sectionNames[selectedSection] || selectedSection);
  const guideline = customGuideline || (sectionGuidelines[selectedSection] || "Provide detailed and well-structured content for this section.");

  if (!selectedSection) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-5">
      <h3 className="text-base font-medium text-gray-800">
        {title}
      </h3>
      <p className="text-sm text-gray-600 mt-2">
        {guideline}
      </p>
    </div>
  );
};

SectionSummary.propTypes = {
  selectedSection: PropTypes.string.isRequired,
  customTitle: PropTypes.string,
  customGuideline: PropTypes.string
};

export default SectionSummary;