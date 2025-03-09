import React from 'react';
import PropTypes from 'prop-types';
import FeedbackModal from './FeedbackModals';
import TaskAchievementDetailsContent from '../Grading/TaskAchievementDetailsContent';
import GrammarDetailsContent from '../Grading/GrammarDetailsContent';
import VocabularyDetailsContent from '../Grading/VocabularyDetailsContent';
import CoherenceDetailsContent from '../Grading/CoherenceDetailsContent';

const FeedbackModalsManager = ({ 
  activeModal, 
  setActiveModal, 
  taskAnalysis, 
  grammarAnalysis, 
  lexicalAnalysis,
  coherenceAnalysis
}) => {
  return (
    <>
      <FeedbackModal
        isOpen={activeModal === 'task'}
        onClose={() => setActiveModal(null)}
        title="Task Achievement Details"
      >
        <TaskAchievementDetailsContent 
          bandScore={taskAnalysis?.band_score}
          feedback={taskAnalysis?.feedback}
          wordCountAnalysis={taskAnalysis?.detailed_analysis?.word_count_analysis}
          structureAnalysis={taskAnalysis?.detailed_analysis?.structure_analysis}
        />
      </FeedbackModal>

      <FeedbackModal
        isOpen={activeModal === 'grammar'}
        onClose={() => setActiveModal(null)}
        title="Grammar & Sentence Structure"
      >
        <GrammarDetailsContent 
          overallScore={grammarAnalysis?.overall_score}
          feedback={grammarAnalysis?.feedback}
          sentenceAnalysis={grammarAnalysis?.sentence_analysis}
          rawScore={grammarAnalysis?.raw_score}
        />
      </FeedbackModal>

      <FeedbackModal
        isOpen={activeModal === 'vocabulary'}
        onClose={() => setActiveModal(null)}
        title="Vocabulary & Word Choice"
      >
        <VocabularyDetailsContent
          overallScore={lexicalAnalysis?.overall_score}
          feedback={lexicalAnalysis?.feedback}
          componentScores={lexicalAnalysis?.component_scores}
          detailedSuggestions={lexicalAnalysis?.detailed_suggestions}
        />
      </FeedbackModal>

      <FeedbackModal
        isOpen={activeModal === 'coherence'}
        onClose={() => setActiveModal(null)}
        title="Coherence & Cohesion"
      >
        <CoherenceDetailsContent 
          overallScore={coherenceAnalysis?.overall_score}
          feedback={coherenceAnalysis?.feedback}
          componentScores={coherenceAnalysis?.component_scores}
          paragraphAnalysis={coherenceAnalysis?.detailed_analysis?.paragraph_structure}
        />
      </FeedbackModal>
    </>
  );
};

FeedbackModalsManager.propTypes = {
  activeModal: PropTypes.oneOf([null, 'task', 'grammar', 'vocabulary', 'coherence']),
  setActiveModal: PropTypes.func.isRequired,
  taskAnalysis: PropTypes.shape({
    band_score: PropTypes.number,
    feedback: PropTypes.object,
    detailed_analysis: PropTypes.shape({
      word_count_analysis: PropTypes.object,
      structure_analysis: PropTypes.object
    })
  }),
  grammarAnalysis: PropTypes.shape({
    overall_score: PropTypes.number,
    feedback: PropTypes.string,
    sentence_analysis: PropTypes.array,
    raw_score: PropTypes.number
  }),
  lexicalAnalysis: PropTypes.shape({
    overall_score: PropTypes.number,
    feedback: PropTypes.object,
    component_scores: PropTypes.object,
    detailed_suggestions: PropTypes.object
  }),
  coherenceAnalysis: PropTypes.shape({
    overall_score: PropTypes.number,
    feedback: PropTypes.object,
    component_scores: PropTypes.object,
    detailed_analysis: PropTypes.shape({
      paragraph_structure: PropTypes.object
    })
  })
};

export default FeedbackModalsManager;