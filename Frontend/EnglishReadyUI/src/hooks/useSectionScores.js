import { useState, useEffect } from 'react';

/**
 * Custom hook to manage section scores based on sectionsData
 * 
 * @param {Object} initialScores - Initial scores configuration object
 * @returns {Array} [sectionScores, setSectionScores, updateSectionScores] - Current scores state, setter function, and update function
 */
export const useSectionScores = (initialScores = {}) => {
  const [sectionScores, setSectionScores] = useState(initialScores);

  // Function to update section scores based on provided sectionsData
  const updateSectionScores = (sectionsData) => {
    if (!sectionsData || Object.keys(sectionsData).length === 0) {
      return;
    }

    const newSectionScores = { ...sectionScores };
    
    Object.keys(sectionsData).forEach(section => {
      if (sectionsData[section]?.grade) {
        const sectionScore = sectionsData[section].grade;
        // Calculate percentage based on the score (assuming score is out of 9)
        const sectionPercentage = Math.min(100, Math.round((sectionScore / 9) * 100));
        
        newSectionScores[section] = {
          score: sectionScore,
          percentage: sectionPercentage
        };
      }
    });
    
    setSectionScores(newSectionScores);
  };

  // Function to calculate overall score based on section scores and weights
  const calculateOverallScore = (weights = {
    introduction: 0.2,
    analysis: 0.6,
    conclusion: 0.2
  }) => {
    const sections = Object.keys(sectionScores);
    if (sections.length === 0) return 0;
    
    let totalScore = 0;
    let totalWeight = 0;
    
    sections.forEach(section => {
      if (sectionScores[section]?.score) {
        const sectionWeight = weights[section] || (1 / sections.length); // Equal weight if not specified
        totalScore += sectionScores[section].score * sectionWeight;
        totalWeight += sectionWeight;
      }
    });
    
    return totalWeight > 0 ? (totalScore / totalWeight) : 0;
  };

  return [sectionScores, setSectionScores, updateSectionScores, calculateOverallScore];
};

export default useSectionScores;