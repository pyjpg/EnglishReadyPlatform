import React from 'react';
import PropTypes from 'prop-types';
import FeedbackModal from './FeedbackModals';
import ContentTemplate from './ContentTemplate'; // Your unified template component

const FeedbackModalsManager = ({ activeModal, setActiveModal, feedbackData }) => {
  // Destructure feedbackData with defaults
  const {
    grammar_analysis: grammarAnalysis = {},
    lexical_analysis: lexicalAnalysis = {},
    task_achievement_analysis: taskAnalysis = {},
    coherence_analysis: coherenceAnalysis = {},
    ielts_score: ieltsScore = 0,
  } = feedbackData || {};

  // Configuration for all modal types
  const modals = [
    { 
      type: 'task', 
      title: 'Task Achievement Details',
      emoji: '🎯',
      getProps: () => ({
        scoreData: { overall_score: taskAnalysis?.overall_score || 0 },
        metrics: [
          { value: taskAnalysis?.main_ideas_count, label: 'Main Ideas', color: 'blue' },
          { value: taskAnalysis?.supporting_details_count, label: 'Supporting Details', color: 'green' }
        ],
        improvementTips: taskAnalysis?.feedback?.improvements || [],
        generalTips: taskAnalysis?.feedback?.recommendations || []
      })
    },
    { 
      type: 'grammar', 
      title: 'Grammar & Sentence Structure',
      emoji: '⚡',
      getProps: () => ({
        scoreData: { overall_score: grammarAnalysis?.overall_score || 0 },
        componentScores: grammarAnalysis?.component_scores || {},
        improvementTips: getGrammarTips(grammarAnalysis?.overall_score),
        generalTips: generalGrammarTips,
        sentenceAnalysis: grammarAnalysis?.sentence_analysis || []
      })
    },
    { 
      type: 'vocabulary', 
      title: 'Vocabulary & Word Choice',
      emoji: '📚',
      getProps: () => ({
        scoreData: { overall_score: lexicalAnalysis?.overall_score || 0 },
        componentScores: lexicalAnalysis?.component_scores || {},
        metrics: [
          { value: lexicalAnalysis?.unique_words, label: 'Unique Words', color: 'purple' },
          { value: lexicalAnalysis?.academic_words, label: 'Academic Words', color: 'amber' }
        ],
        improvementTips: lexicalAnalysis?.feedback?.improvements || [],
        generalTips: lexicalAnalysis?.feedback?.recommendations || []
      })
    },
    { 
      type: 'coherence', 
      title: 'Coherence & Cohesion',
      emoji: '🧩',
      getProps: () => ({
        scoreData: { overall_score: coherenceAnalysis?.overall_score || 0 },
        componentScores: coherenceAnalysis?.component_scores || {},
        metrics: [
          { value: coherenceAnalysis?.paragraph_count, label: 'Paragraphs', color: 'purple' },
          { value: coherenceAnalysis?.linking_devices, label: 'Linking Devices', color: 'green' }
        ],
        improvementTips: coherenceAnalysis?.feedback?.improvements || [],
        generalTips: coherenceAnalysis?.feedback?.recommendations || []
      })
    }
  ];

  // Grammar-specific helpers
  const getGrammarTips = (score) => {
    if (score >= 8) return ["Advanced structures", "Punctuation refinement", "Stylistic variations"];
    if (score >= 7) return ["Tense consistency", "Article usage", "Relative clauses"];
    if (score >= 6) return ["Subject-verb agreement", "Comma usage", "Prepositions"];
    return ["Basic structure", "Verb tenses", "Complete sentences"];
  };

  const generalGrammarTips = [
    "Check subject-verb agreement",
    "Use commas properly",
    "Maintain consistent tenses",
    "Use articles correctly"
  ];

  return (
    <>
      {modals.map(({ type, title, emoji, getProps }) => (
        <FeedbackModal
          key={type}
          isOpen={activeModal === type}
          onClose={() => setActiveModal(null)}
          title={title}
        >
          <ContentTemplate
            {...getProps()}
            emoji={emoji}
            title={title}
            ieltsScore={ieltsScore}
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
    ielts_score: PropTypes.number
  })
};

export default FeedbackModalsManager;