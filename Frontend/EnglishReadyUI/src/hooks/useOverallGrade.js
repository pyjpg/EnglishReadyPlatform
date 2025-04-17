import { useMemo } from 'react';

export const useOverallGrade = (sectionsData, feedbackData) => {
  return useMemo(() => {
    if (!sectionsData || Object.keys(sectionsData).length === 0) {
      return feedbackData?.grade || 0;
    }

    const weights = {
      introduction: 0.2,
      analysis: 0.6,
      conclusion: 0.2
    };

    let totalScore = 0;
    let totalWeight = 0;

    const validSections = Object.keys(sectionsData).filter(section =>
      ['introduction', 'analysis', 'conclusion'].includes(section)
    );

    validSections.forEach(section => {
      if (sectionsData[section]?.grade) {
        totalScore += sectionsData[section].grade * (weights[section] || 0.33);
        totalWeight += (weights[section] || 0.33);
      }
    });

    return totalWeight > 0 ? (totalScore / totalWeight) : (feedbackData?.grade || 0);
  }, [sectionsData, feedbackData]);
};
