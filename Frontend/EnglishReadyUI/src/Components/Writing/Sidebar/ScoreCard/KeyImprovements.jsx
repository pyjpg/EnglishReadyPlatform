// src/components/Writing/WritingSidebar/KeyImprovements.jsx
import React from 'react';
import PropTypes from 'prop-types';
import KeyImprovementItem from '../../Grading/KeyImprovementItem';

const KeyImprovements = ({ feedbackData }) => {
  // Get priority improvements from all categories
  const getKeyImprovements = () => {
    const improvements = [];
    const { 
      task_achievement_analysis: taskAnalysis = {}, 
      grammar_analysis: grammarAnalysis = {},
      lexical_analysis: lexicalAnalysis = {},
      coherence_analysis: coherenceAnalysis = {}
    } = feedbackData;
    
    // Task Achievement improvements
    if (taskAnalysis?.feedback?.improvements?.length) {
      improvements.push(...taskAnalysis.feedback.improvements);
    }
    
    // Grammar improvements
    if (grammarAnalysis?.feedback) {
      const grammarFeedback = typeof grammarAnalysis.feedback === 'string' 
        ? grammarAnalysis.feedback 
        : '';
      if (grammarFeedback) {
        improvements.push(grammarFeedback);
      }
    }
    
    // Vocabulary improvements
    if (lexicalAnalysis?.feedback?.improvements?.length) {
      improvements.push(...lexicalAnalysis.feedback.improvements);
    } else if (typeof lexicalAnalysis?.feedback === 'string') {
      improvements.push(lexicalAnalysis.feedback);
    }
    
    // Coherence improvements
    if (coherenceAnalysis?.feedback?.improvements?.length) {
      improvements.push(...coherenceAnalysis.feedback.improvements);
    }

    return improvements.slice(0, 3).map(text => ({
      text,
      priority: determinePriority(text)
    }));
  };

  // Determine priority based on content
  const determinePriority = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('add') || lowerText.includes('high')) return 'high';
    if (lowerText.includes('medium')) return 'medium';
    return 'low';
  };

  const improvements = getKeyImprovements();
  
  if (!improvements.length) return null;

  return (
    <div className="mb-5">
      <h3 className="text-sm font-medium text-gray-700">Key Improvements</h3>
      {improvements.map((item, index) => (
        <KeyImprovementItem 
          key={`improvement-${index}`} 
          text={item.text} 
          priority={item.priority} 
        />
      ))}
    </div>
  );
};

KeyImprovements.propTypes = {
  feedbackData: PropTypes.object.isRequired
};

export default KeyImprovements;