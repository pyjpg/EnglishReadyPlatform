import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CircularProgress from './CircularProgress';
import CompactScoreIndicator from '../Grading/CompactScoreIndicator';
import KeyImprovementItem from '../Grading/KeyImprovementItem';
import FeedbackModalsManager from '../Grading/FeedbackModalManager';

const WritingSidebar = ({
  feedbackData,
  isSubmitting,
  onSubmit,
  onExit,
  essayText,
  taskType,
  questionNumber,
  questionDesc = "The graph above shows population growth in different regions. Write a report describing the key features and make comparisons where relevant. You should write at least 150 words.",
  questionRequirements = "A strong introduction should paraphrase the question and provide a general overview without specific data."
}) => {
  const [activeModal, setActiveModal] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  
  // Check if we have feedback data to determine if the essay has been graded
  const isGraded = feedbackData && Object.keys(feedbackData).length > 0;
  
  // Destructure API response with safe defaults
  const {
    grade = 0,
    ielts_score = 0,
    grammar_analysis: grammarAnalysis = {},
    lexical_analysis: lexicalAnalysis = {},
    task_achievement_analysis: taskAnalysis = {},
    coherence_analysis: coherenceAnalysis = {}
  } = feedbackData || {};

  // Format the score as a decimal (4.5/9.0)
  const formatScore = (score) => {
    return score ? score.toFixed(1) : '0.0';
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get priority improvements from all categories
  const getKeyImprovements = () => {
    const improvements = [];
    
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

  // Consistent card renderer for all analysis types (except grammar)
  const renderAnalysisCard = ({
    analysisData,
    criteriaType,
    title,
    scoreKey = 'overall_score',
    colorClass = 'blue',
    metricsRenderer,
    feedbackKey
  }) => {
    if (!analysisData || !analysisData[scoreKey]) return null;

    const score = analysisData[scoreKey];
    const colorVariants = {
      blue: { text: 'text-blue-600', bg: 'bg-blue-500' },
      green: { text: 'text-green-600', bg: 'bg-green-500' },
      purple: { text: 'text-purple-600', bg: 'bg-purple-500' },
      amber: { text: 'text-amber-600', bg: 'bg-amber-500' }
    };

    // Extract feedback based on the provided key structure
    let feedback;
    if (feedbackKey) {
      if (feedbackKey.includes('.')) {
        const [key1, key2] = feedbackKey.split('.');
        feedback = analysisData[key1] && analysisData[key1][key2];
      } else {
        feedback = analysisData[feedbackKey];
      }
    }

    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-5">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-medium text-gray-800">{title}</h3>
          <button 
            onClick={() => setActiveModal(criteriaType)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            View Details
          </button>
        </div>
        
        {/* Score Section */}
        <div className="mt-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">{title} Score</span>
            <span className={`text-sm font-medium ${colorVariants[colorClass].text}`}>
              {formatScore(score)}/9.0
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className={`${colorVariants[colorClass].bg} rounded-full h-2`} 
              style={{ width: `${(score / 9) * 100}%` }}
            />
          </div>
        </div>

        {/* Custom Metrics Section */}
        {metricsRenderer && metricsRenderer(analysisData)}

        {/* Feedback Section */}
        {feedback && (
          <div className="mt-3">
            <h4 className="text-xs font-medium text-gray-700">Feedback</h4>
            <p className="text-sm text-gray-600 mt-1">
              {Array.isArray(feedback)
                ? feedback[0]
                : typeof feedback === 'string'
                  ? feedback
                  : 'No specific feedback available'}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Improved Grammar Analysis Card with collapsible sentence analysis
  const renderGrammarAnalysis = () => {
    if (!grammarAnalysis || !grammarAnalysis.overall_score) return null;
    
    const isExpanded = !!expandedSections.grammar;
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-5">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-medium text-gray-800">Grammar & Sentence Structure</h3>
          <div className="flex space-x-3">
            <button 
              onClick={() => toggleSection('grammar')}
              className="text-xs text-gray-600 hover:text-gray-800"
            >
              {isExpanded ? "Hide Analysis" : "Show Analysis"}
            </button>
            <button 
              onClick={() => setActiveModal('grammar')}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              View Details
            </button>
          </div>
        </div>
        
        {/* Score Section */}
        <div className="mt-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Grammar Score</span>
            <span className="text-sm font-medium text-green-600">
              {formatScore(grammarAnalysis.overall_score)}/9.0
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-green-500 rounded-full h-2" 
              style={{ width: `${(grammarAnalysis.overall_score / 9) * 100}%` }}
            />
          </div>
        </div>

        {/* Feedback Section */}
        {grammarAnalysis.feedback && (
          <div className="mt-3">
            <h4 className="text-xs font-medium text-gray-700">Feedback</h4>
            <p className="text-sm text-gray-600 mt-1">
              {typeof grammarAnalysis.feedback === 'string'
                ? grammarAnalysis.feedback
                : 'No specific feedback available'}
            </p>
          </div>
        )}
        
        {/* Condensed Sentence Analysis (Only shown when expanded) */}
        {isExpanded && grammarAnalysis.sentence_analysis && grammarAnalysis.sentence_analysis.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-medium text-gray-700">Sentence Quality</h4>
            <div className="bg-gray-50 p-3 rounded-lg mt-2">
              <div className="space-y-2">
                {grammarAnalysis.sentence_analysis.map((sentence, index) => (
                  <div key={`sentence-${index}`} className="flex items-center">
                    <span className="text-xs w-20 text-gray-600">Sentence {index + 1}:</span>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-green-500 rounded-full h-1.5" 
                          style={{ width: `${sentence.score || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-xs ml-2 text-gray-600">{sentence.score ? `${Math.round(sentence.score)}%` : 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Vocabulary Analysis
  const renderVocabularyAnalysis = () => renderAnalysisCard({
    analysisData: lexicalAnalysis,
    criteriaType: 'vocabulary',
    title: 'Vocabulary & Word Choice',
    colorClass: 'blue',
    metricsRenderer: (lexicalAnalysis) => (
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="text-xs font-medium text-gray-500 mb-1">Unique Words</h4>
          <p className="text-lg font-semibold text-gray-800">{lexicalAnalysis.detailed_analysis?.lexical_diversity?.unique_words || 0}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="text-xs font-medium text-gray-500 mb-1">Lexical Diversity</h4>
          <p className="text-lg font-semibold text-gray-800">
            {lexicalAnalysis.detailed_analysis?.lexical_diversity?.diversity_ratio?.toFixed(2) || 0}%
          </p>
        </div>
      </div>
    ),
    feedbackKey: 'feedback'
  });

  // Task Achievement Analysis
  const renderTaskAnalysis = () => renderAnalysisCard({
    analysisData: taskAnalysis,
    criteriaType: 'task',
    title: 'Task Achievement',
    colorClass: 'purple',
    scoreKey: 'band_score',
    feedbackKey: 'feedback.strengths',
    metricsRenderer: (data) => (
      <div className="mt-4">
        <h4 className="text-xs font-medium text-gray-500 mb-2">Task Requirements Met</h4>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-700">
            {data.feedback?.strengths?.[0] || 'Strong topic relevance and task achievement'}
          </p>
        </div>
      </div>
    )
  });

  // Coherence Analysis
  const renderCoherenceAnalysis = () => renderAnalysisCard({
    analysisData: coherenceAnalysis,
    criteriaType: 'coherence',
    title: 'Coherence & Cohesion',
    colorClass: 'amber',
    feedbackKey: 'feedback.improvements',
    metricsRenderer: (data) => (
      <div className="mt-4">
        <h4 className="text-xs font-medium text-gray-500 mb-2">Organization Quality</h4>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-700">
            {data.feedback?.strengths?.[0] || 'Logical flow and organization of ideas'}
          </p>
        </div>
      </div>
    )
  });

  // Handler for submitting the essay
  const handleSubmit = () => {
    // Create the payload for the API
    const payload = {
      text: essayText,
      task_type: taskType,
      question_number: questionNumber,
      question_desc: questionDesc,
      question_requirements: questionRequirements
    };
    
    // Call the onSubmit function with the payload
    onSubmit(payload);
  };

  return (
    <div className="w-72 border-l bg-gray-50 p-4 flex flex-col h-full overflow-y-auto">
      {/* Current Grade Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-5">
        <h3 className="text-base font-medium text-gray-800">Current Grade</h3>
        <CircularProgress percentage={grade} />
        
        {isGraded && (
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

      {isGraded ? (
        <>
          {/* Key Improvements Section */}
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
          
          {/* Consistent Analysis Cards for all criteria */}
          {renderVocabularyAnalysis()}
          {renderGrammarAnalysis()} {/* Using the improved grammar section */}
          {renderTaskAnalysis()}
          {renderCoherenceAnalysis()}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 italic text-center">Submit your essay to receive detailed feedback and scoring.</p>
        </div>
      )}

      {/* Submit/Exit Buttons */}
      <div className="mt-auto space-y-2">
        <button
          onClick={handleSubmit}
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

      {/* Modals */}
      <FeedbackModalsManager
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        feedbackData={feedbackData}
      />
    </div>
  );
};

WritingSidebar.propTypes = {
  feedbackData: PropTypes.shape({
    grade: PropTypes.number,
    ielts_score: PropTypes.number,
    grammar_analysis: PropTypes.shape({
      overall_score: PropTypes.number,
      feedback: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
      ]),
      sentence_analysis: PropTypes.array,
    }),
    lexical_analysis: PropTypes.shape({
      overall_score: PropTypes.number,
      detailed_analysis: PropTypes.shape({
        lexical_diversity: PropTypes.shape({
          unique_words: PropTypes.number,
          diversity_ratio: PropTypes.number
        })
      }),
      feedback: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          improvements: PropTypes.arrayOf(PropTypes.string),
        })
      ]),
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
  essayText: PropTypes.string.isRequired,
  taskType: PropTypes.string.isRequired,
  questionNumber: PropTypes.number.isRequired,
  questionDesc: PropTypes.string,
  questionRequirements: PropTypes.string,
};

export default WritingSidebar;