import React from 'react';
import PropTypes from 'prop-types';
import FeedbackModal from './FeedbackModals';
import TaskAchievementDetailsContent from './TaskAchievementDetailsContent';
import GrammarDetailsContent from './GrammarDetailsContent';
import VocabularyDetailsContent from './VocabularyDetailsContent';
import CoherenceDetailsContent from './CoherenceDetailsContent';

const FeedbackModalsManager = ({ activeModal, setActiveModal, feedbackData }) => {
  // Destructure feedbackData with defaults
  const {
    grammar_analysis: grammarAnalysis = {},
    lexical_analysis: lexicalAnalysis = {},
    task_achievement_analysis: taskAnalysis = {},
    coherence_analysis: coherenceAnalysis = {},
    ielts_score: ieltsScore = 0, // Destructure IELTS score
  } = feedbackData || {};

  console.log(grammarAnalysis);
  // Modal content mapping to reduce repetitive code
  const modals = [
    { type: 'task', title: 'Task Achievement Details', component: TaskAchievementDetailsContent, analysis: taskAnalysis },
    { type: 'grammar', title: 'Grammar & Sentence Structure', component: GrammarDetailsContent, analysis: grammarAnalysis },
    { type: 'vocabulary', title: 'Vocabulary & Word Choice', component: VocabularyDetailsContent, analysis: lexicalAnalysis },
    { type: 'coherence', title: 'Coherence & Cohesion', component: CoherenceDetailsContent, analysis: coherenceAnalysis }
  ];

  return (
    <>
      {modals.map(({ type, title, component: ContentComponent, analysis }) => (
  <FeedbackModal
    key={type}
    isOpen={activeModal === type}
    onClose={() => setActiveModal(null)}
    title={title}
  >
    <ContentComponent 
      {...{ [`${type}Analysis`]: analysis }} 
      ieltsScore={ieltsScore} // Pass IELTS score here
    />
  </FeedbackModal>
))}
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
    ielts_score: PropTypes.number // Add IELTS score prop type
  })
};

export default FeedbackModalsManager;
