import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CircularProgress from './CircularProgress';
import FeedbackSummaryCard from '../Grading/FeedbackSummary';
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
  questionNumber
}) => {
  const [activeModal, setActiveModal] = useState(null);
  
  // Check if we have feedback data to determine if the essay has been graded
  const isGraded = feedbackData && Object.keys(feedbackData).length > 0;
  
  // Destructure API response with safe defaults
  const {
    grade = 0,
    ielts_score = 0, // Extract IELTS score from feedback data
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
      
      const grammarFeedback = typeof grammarAnalysis.feedback === 'string' 
        ? grammarAnalysis.feedback 
        : '';
      if (grammarFeedback) {
        improvements.push(grammarFeedback);
      }
      console.log(grammarFeedback);
      console.log("oioiooaiaia");
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

  // Format the score as a decimal (4.5/9.0)
  const formatScore = (score) => {
    return score ? score.toFixed(1) : '0.0';
  };

  // Generate sentence analysis component
  const renderSentenceAnalysis = (sentences) => {
    if (!sentences || sentences.length === 0) return null;
    
    return (
      <div className="mt-4 space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Sentence Analysis</h4>
        {sentences.map((sentence, index) => (
          <div key={`sentence-${index}`} className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-700">Sentence {index + 1}</span>
              <span className="text-xs font-medium text-gray-700">{sentence.score ? `${sentence.score}%` : 'N/A'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-green-500 rounded-full h-1.5" 
                style={{ width: `${sentence.score || 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">{sentence.text || 'No analysis available.'}</p>
          </div>
        ))}
      </div>
    );
  };
  console.log(grammarAnalysis);
  // Generate vocabulary/word choice analysis
  const renderVocabularyAnalysis = () => {
    if (!lexicalAnalysis || !lexicalAnalysis.overall_score) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-5">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-medium text-gray-800">Vocabulary & Word Choice</h3>
          <button 
            onClick={() => setActiveModal('vocabulary')}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            View Details
          </button>
        </div>
        
        <div className="mt-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Vocabulary Score</span>
            <span className="text-sm font-medium text-blue-600">{formatScore(lexicalAnalysis.overall_score)}/9.0</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-500 rounded-full h-2" 
              style={{ width: `${(lexicalAnalysis.overall_score / 9) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-xs font-medium text-gray-500 mb-1">Unique Words</h4>
            <p className="text-lg font-semibold text-gray-800">{lexicalAnalysis.unique_words || 0}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-xs font-medium text-gray-500 mb-1">Lexical Diversity</h4>
            <p className="text-lg font-semibold text-gray-800">
              {lexicalAnalysis.unique_words && lexicalAnalysis.total_words
                ? ((lexicalAnalysis.unique_words / lexicalAnalysis.total_words) * 100).toFixed(1)
                : '0.0'}%
            </p>
          </div>
        </div>
        
        {lexicalAnalysis.feedback && (
          <div className="mt-3">
            <h4 className="text-xs font-medium text-gray-700">Feedback</h4>
            <p className="text-sm text-gray-600 mt-1">
              {Array.isArray(lexicalAnalysis.feedback)
                ? lexicalAnalysis.feedback[0]
                : typeof lexicalAnalysis.feedback === 'string'
                  ? lexicalAnalysis.feedback
                  : lexicalAnalysis.feedback?.improvements?.[0] || 'No specific feedback available'}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Generate grammar analysis component
  const renderGrammarAnalysis = () => {
    if (!grammarAnalysis || !grammarAnalysis.overall_score) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-5">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-medium text-gray-800">Grammar & Sentence Structure</h3>
          <button 
            onClick={() => setActiveModal('grammar')}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            View Details
          </button>
        </div>
        
        <div className="mt-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Grammar Score</span>
            <span className="text-sm font-medium text-green-600">{formatScore(grammarAnalysis.overall_score)}/9.0</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-green-500 rounded-full h-2" 
              style={{ width: `${(grammarAnalysis.overall_score / 9) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-3">
          <h4 className="text-xs font-medium text-gray-700">Grammar Feedback</h4>
          <p className="text-sm text-gray-600 mt-1">
            {typeof grammarAnalysis.feedback === 'string' 
              ? grammarAnalysis.feedback 
              : 'No specific feedback available'}
          </p>
        </div>
        
        {renderSentenceAnalysis(grammarAnalysis.sentence_analysis)}
      </div>
    );
  };

  // Handler for submitting the essay
  const handleSubmit = () => {
    // Create the payload for the API
    const payload = {
      text: essayText,
      task_type: taskType,
      question_number: questionNumber
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
          
          {/* Detailed Analysis Cards */}
          {renderVocabularyAnalysis()}
          {renderGrammarAnalysis()}
          
          {/* Summary Cards */}
          <FeedbackSummaryCard
            title="Task Achievement"
            summary={taskAnalysis?.feedback?.strengths?.[0] || 'No specific feedback available'}
            onClick={() => setActiveModal('task')}
            color="blue"
          />
          <FeedbackSummaryCard
            title="Coherence"
            summary={coherenceAnalysis?.feedback?.improvements?.[0] || 'No specific feedback available'}
            onClick={() => setActiveModal('coherence')}
            color="purple"
          />
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
        taskAnalysis={taskAnalysis}
        feedbackData={feedbackData} // Pass the IELTS score to the modal manager
      />
    </div>
  );
};

WritingSidebar.propTypes = {
  feedbackData: PropTypes.shape({
    grade: PropTypes.number,
    ielts_score: PropTypes.number, // Add PropType for IELTS score
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
      unique_words: PropTypes.number,
      total_words: PropTypes.number,
      frequent_words: PropTypes.array,
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
  questionNumber: PropTypes.number.isRequired
};

export default WritingSidebar;