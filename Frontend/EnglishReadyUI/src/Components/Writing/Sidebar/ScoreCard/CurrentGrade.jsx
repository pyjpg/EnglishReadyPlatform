import React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from './CircularProgress';
import CompactScoreIndicator from '../../Grading/CompactScoreIndicator';

const CurrentGrade = ({ grade, isGraded, feedbackData, setActiveModal }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-5">
      <h3 className="text-base font-medium text-gray-800">Current Grade</h3>
      <CircularProgress percentage={grade} />
      
      {isGraded && (
        <>
          <CompactScoreIndicator 
            score={feedbackData.task_achievement_analysis?.band_score || 0}
            maxScore={9}
            label="Task Achievement"
            onClick={() => setActiveModal('task')}
            tooltip="Measures how well you addressed the task requirements"
          />
          <CompactScoreIndicator
            score={feedbackData.grammar_analysis?.overall_score || 0}
            maxScore={9}
            label="Grammar"
            onClick={() => setActiveModal('grammar')}
            tooltip="Evaluates grammatical accuracy and sentence structures"
          />
          <CompactScoreIndicator
            score={feedbackData.lexical_analysis?.overall_score || 0}
            maxScore={9}
            label="Vocabulary"
            onClick={() => setActiveModal('vocabulary')}
            tooltip="Assesses range and appropriateness of vocabulary"
          />
          <CompactScoreIndicator
            score={feedbackData.coherence_analysis?.overall_score || 0}
            maxScore={9}
            label="Coherence"
            onClick={() => setActiveModal('coherence')}
            tooltip="Measures logical flow and organization of ideas"
          />
        </>
      )}
    </div>
  );
};

CurrentGrade.propTypes = {
  grade: PropTypes.number.isRequired,
  isGraded: PropTypes.bool.isRequired,
  feedbackData: PropTypes.object.isRequired,
  setActiveModal: PropTypes.func.isRequired
};

export default CurrentGrade;