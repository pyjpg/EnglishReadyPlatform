import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CircularProgress from './CircularProgress';
import FeedbackSummaryCard from '../Grading/FeedbackSummary';
import CompactScoreIndicator from '../Grading/CompactScoreIndicator';
import KeyImprovementItem from '../Grading/KeyImprovementItem';
import FeedbackModalsManager from '../Grading/FeedbackModalManager';

const WritingSidebar = ({
  submissionStatus,
  feedbackData,
  isSubmitting,
  onSubmit,
  onExit,
  
}) => {
  const [activeModal, setActiveModal] = useState(null);
  
  // Destructure API response with safe defaults
  const {
    grade = 0,
    grammar_analysis: grammarAnalysis = {},
    lexical_analysis: lexicalAnalysis = {},
    task_achievement_analysis: taskAnalysis = {},
    coherence_analysis: coherenceAnalysis = {}
  } = feedbackData || {};

  // Get priority improvements from all categories
  const getKeyImprovements = () => {
    const improvements = [];
    
    // Task Achievement improvements
    if (taskAnalysis?.feedback?.improvements?.length) {
      improvements.push(...taskAnalysis.feedback.improvements);
    }
    
    // Grammar improvements
    if (grammarAnalysis?.feedback) {
      improvements.push(grammarAnalysis.feedback);
    }
    
    // Vocabulary improvements
    if (lexicalAnalysis?.feedback?.improvements?.length) {
      improvements.push(...lexicalAnalysis.feedback.improvements);
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
  // In WritingSidebar
console.log('Feedback Data:', feedbackData);
console.log('Submission Status:', submissionStatus);

  return (
    <div className="w-72 border-l bg-gray-50 p-4 flex flex-col h-full overflow-y-auto">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-5">
        <h3 className="text-base font-medium text-gray-800">Current Grade</h3>
        <CircularProgress percentage={grade} />
        
        {submissionStatus === 'graded' && (
          <>
            <CompactScoreIndicator 
              score={taskAnalysis?.band_score || 0}
              maxScore={9}
              label="Task Achievement"
              onClick={() => setActiveModal('task')}
              tooltip="Measures how well you addressed the task requirements"
            />
            <CompactScoreIndicator
              score={grammarAnalysis?.overall_score || 0}
              maxScore={9}
              label="Grammar"
              onClick={() => setActiveModal('grammar')}
              tooltip="Evaluates grammatical accuracy and sentence structures"
            />
            <CompactScoreIndicator
              score={lexicalAnalysis?.overall_score || 0}
              maxScore={9}
              label="Vocabulary"
              onClick={() => setActiveModal('vocabulary')}
              tooltip="Assesses range and appropriateness of vocabulary"
            />
            <CompactScoreIndicator
              score={coherenceAnalysis?.overall_score || 0}
              maxScore={9}
              label="Coherence"
              onClick={() => setActiveModal('coherence')}
              tooltip="Measures logical flow and organization of ideas"
            />
          </>
        )}
      </div>

     
        <>
          <div className="mb-5">
            <h3 className="text-sm font-medium text-gray-700">Key Improvements</h3>
            {getKeyImprovements().map((item, index) => (
              <KeyImprovementItem 
                key={`improvement-${index}`} 
                text={item.text} 
                priority={item.priority} 
              />
            ))}
          </div>
          
          <FeedbackSummaryCard
            title="Task Achievement"
            summary={taskAnalysis?.feedback?.strengths?.[0] || 'No specific feedback available'}
            onClick={() => setActiveModal('task')}
            color="blue"
          />
          <FeedbackSummaryCard
            title="Grammar"
            summary={grammarAnalysis?.feedback || 'No specific feedback available'}
            onClick={() => setActiveModal('grammar')}
            color="green"
          />
          <FeedbackSummaryCard
            title="Vocabulary"
            summary={lexicalAnalysis?.feedback?.improvements?.[0] || 'No specific feedback available'}
            onClick={() => setActiveModal('vocabulary')}
            color="amber"
          />
          <FeedbackSummaryCard
            title="Coherence"
            summary={coherenceAnalysis?.feedback?.improvements?.[0] || 'No specific feedback available'}
            onClick={() => setActiveModal('coherence')}
            color="purple"
          />
        </>

      <div className="mt-auto space-y-2">
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Essay'}
        </button>
        <button
          onClick={onExit}
          className="w-full px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Exit Writing Mode
        </button>
      </div>

      <FeedbackModalsManager
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        taskAnalysis={taskAnalysis}
        grammarAnalysis={grammarAnalysis}
        lexicalAnalysis={lexicalAnalysis}
        coherenceAnalysis={coherenceAnalysis}
      />
    </div>
  );
};

WritingSidebar.propTypes = {
  submissionStatus: PropTypes.oneOf(['idle', 'graded', 'error']),
  feedbackData: PropTypes.shape({
    grade: PropTypes.number,
    grammar_analysis: PropTypes.shape({
      overall_score: PropTypes.number,
      feedback: PropTypes.string,
      sentence_analysis: PropTypes.array,
    }),
    lexical_analysis: PropTypes.shape({
      overall_score: PropTypes.number,
      feedback: PropTypes.shape({
        improvements: PropTypes.arrayOf(PropTypes.string),
      }),
    }),
    task_achievement_analysis: PropTypes.shape({
      band_score: PropTypes.number,
      feedback: PropTypes.shape({
        strengths: PropTypes.arrayOf(PropTypes.string),
        improvements: PropTypes.arrayOf(PropTypes.string),
      }),
    }),
    coherence_analysis: PropTypes.shape({
      overall_score: PropTypes.number,
      feedback: PropTypes.shape({
        improvements: PropTypes.arrayOf(PropTypes.string),
      }),
    }),
  }),
  isSubmitting: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onExit: PropTypes.func.isRequired,
  currentText: PropTypes.string.isRequired,
};

export default WritingSidebar;