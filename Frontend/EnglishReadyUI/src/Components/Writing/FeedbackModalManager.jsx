import React from 'react';
import PropTypes from 'prop-types';
import FeedbackModal from './FeedbackModals';
import TaskAchievementDetailsContent from './TaskAchievementDetailsContent';
import GrammarDetailsContent from './GrammarDetailsContent';
import VocabularyDetailsContent from './VocabularyDetailsContent';

// Component to handle all feedback modals in one place
const FeedbackModalsManager = ({ 
  activeModal, 
  setActiveModal, 
  taskAchievementAnalysis, 
  grammarAnalysis, 
  lexicalAnalysis 
}) => {
  return (
    <>
      {/* Task Achievement Modal */}
      <FeedbackModal
        isOpen={activeModal === 'task'}
        onClose={() => setActiveModal(null)}
        title="Task Achievement Details"
      >
        <TaskAchievementDetailsContent taskAchievementAnalysis={taskAchievementAnalysis} />
      </FeedbackModal>
      
      {/* Grammar Modal */}
      <FeedbackModal
        isOpen={activeModal === 'grammar'}
        onClose={() => setActiveModal(null)}
        title="Grammar & Sentence Structure"
      >
        <GrammarDetailsContent grammarAnalysis={grammarAnalysis} />
      </FeedbackModal>
      
      {/* Vocabulary Modal */}
      <FeedbackModal
        isOpen={activeModal === 'vocabulary'}
        onClose={() => setActiveModal(null)}
        title="Vocabulary & Word Choice"
      >
        <VocabularyDetailsContent lexicalAnalysis={lexicalAnalysis} />
      </FeedbackModal>
    </>
  );
};

FeedbackModalsManager.propTypes = {
  activeModal: PropTypes.oneOf([null, 'task', 'grammar', 'vocabulary']),
  setActiveModal: PropTypes.func.isRequired,
  taskAchievementAnalysis: PropTypes.object,
  grammarAnalysis: PropTypes.object,
  lexicalAnalysis: PropTypes.object
};

export default FeedbackModalsManager;