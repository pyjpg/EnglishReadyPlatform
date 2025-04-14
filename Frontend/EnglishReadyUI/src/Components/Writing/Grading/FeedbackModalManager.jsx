import React from 'react';
import PropTypes from 'prop-types';
import FeedbackModal from './FeedbackModals';
import TaskAchievementDetailsContent from './TaskAchievement/TaskAchievementDetailsContent';
import GrammarDetailsContent from './Grammar/GrammarDetailsContent';
import VocabularyDetailsContent from './Lexical/VocabularyDetailsContent';
import CoherenceDetailsContent from './Coherence/CoherenceDetailsContent';
import VocabularyFeedback from './Lexical/VocabularyDetailsContent';

const FeedbackModalsManager = ({ activeModal, setActiveModal, feedbackData }) => {
  // Destructure feedbackData with defaults
  const {
    grammar_analysis: grammarAnalysis = {},
    lexical_analysis: lexicalAnalysis = {},
    task_achievement_analysis: taskAnalysis = {},
    coherence_analysis: coherenceAnalysis = {},
    ielts_score: ieltsScore = 0,
  } = feedbackData || {};
  
  console.log("Lexical Analysis in Manager:", lexicalAnalysis);
  
  return (
    <>
      <FeedbackModal
        key="task"
        isOpen={activeModal === 'task'}
        onClose={() => setActiveModal(null)}
        title="Task Achievement Details"
      >
        <TaskAchievementDetailsContent
          taskAchievementAnalysis={taskAnalysis}
          ieltsScore={ieltsScore}
        />
      </FeedbackModal>
      
      <FeedbackModal
        key="grammar"
        isOpen={activeModal === 'grammar'}
        onClose={() => setActiveModal(null)}
        title="Grammar & Sentence Structure"
      >
        <GrammarDetailsContent
          grammarAnalysis={grammarAnalysis}
          ieltsScore={ieltsScore}
        />
      </FeedbackModal>
      
      <FeedbackModal
        key="vocabulary"
        isOpen={activeModal === 'vocabulary'}
        onClose={() => setActiveModal(null)}
        title="Vocabulary & Word Choice"
      >
        <VocabularyFeedback
          lexicalAnalysis={lexicalAnalysis}
          ieltsScore={ieltsScore}
        />
      </FeedbackModal>
      
      <FeedbackModal
        key="coherence"
        isOpen={activeModal === 'coherence'}
        onClose={() => setActiveModal(null)}
        title="Coherence & Cohesion"
      >
        <CoherenceDetailsContent
          coherenceAnalysis={coherenceAnalysis}
          ieltsScore={ieltsScore}
        />
      </FeedbackModal>
    </>
  );
};

FeedbackModalsManager.propTypes = {
  activeModal: PropTypes.oneOf([null, 'task', 'grammar', 'vocabulary', 'coherence']),
  setActiveModal: PropTypes.func.isRequired,
  feedbackData: PropTypes.shape({
    grammar_analysis: PropTypes.object,
    lexical_analysis: PropTypes.object,
    task_achievement_analysis: PropTypes.object,
    coherence_analysis: PropTypes.object,
    ielts_score: PropTypes.number
  })
};

export default FeedbackModalsManager;