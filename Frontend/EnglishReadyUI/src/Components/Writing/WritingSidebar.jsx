import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CircularProgress from './CircularProgress';
import FeedbackSummaryCard from './FeedbackSummary';
import CompactScoreIndicator from './CompactScoreIndicator';
import KeyImprovementItem from './KeyImprovementItem';
import FeedbackModalsManager from './FeedbackModalManager';
import FeedbackIcons from './FeedbackIcons';

const WritingSidebar = ({ 
  grade, 
  submissionStatus, 
  handleSubmit, 
  setIsWritingMode, 
  grammarAnalysis,
  lexicalAnalysis,
  taskAchievementAnalysis,
  coherenceAnalysis
}) => {
  // State for modal management
  const [activeModal, setActiveModal] = useState(null);
  
  // Questions for the progress section
  const questions = [1, 2, 3, 4, 5, 6];
  
  // Helper to get key improvements across all areas
  const getKeyImprovements = () => {
    const improvements = [];
    
    // Word count improvement (highest priority if below requirement)
    if (taskAchievementAnalysis?.detailed_analysis?.word_count_analysis?.meets_requirement === false) {
      improvements.push({
        text: `Add ${Math.abs(taskAchievementAnalysis.detailed_analysis.word_count_analysis.difference)} more words to meet the minimum requirement`,
        priority: "high"
      });
    }
    
    // Add one task achievement improvement
    if (taskAchievementAnalysis?.feedback?.improvements?.length > 0) {
      improvements.push({
        text: taskAchievementAnalysis.feedback.improvements[0],
        priority: "medium"
      });
    }
    
    // Add one grammar improvement
    if (grammarAnalysis?.feedback) {
      const grammarSuggestion = grammarAnalysis.feedback.split('.')[0] + '.';
      improvements.push({
        text: grammarSuggestion,
        priority: grammarAnalysis.overall_score < 5 ? "medium" : "low"
      });
    }
    
    // Add one vocabulary improvement
    if (lexicalAnalysis?.feedback?.improvements?.length > 0) {
      improvements.push({
        text: lexicalAnalysis.feedback.improvements[0],
        priority: lexicalAnalysis.overall_score < 5 ? "medium" : "low"
      });
      if (coherenceAnalysis?.improvements?.length > 0) {
        improvements.push({
          text: coherenceAnalysis.improvements[0],
          priority: coherenceAnalysis.overall_score < 5 ? "medium" : "low"
        });
      }
    }
    
    return improvements;
  };
  
  // For readability - destructure nested objects
  const wordCount = taskAchievementAnalysis?.detailed_analysis?.word_count_analysis?.word_count || 0;
  const wordCountDifference = taskAchievementAnalysis?.detailed_analysis?.word_count_analysis?.difference || 0;
  const meetsWordRequirement = taskAchievementAnalysis?.detailed_analysis?.word_count_analysis?.meets_requirement || false;
  
  // Add the modals manager
  return (
    <>
      <div className="w-72 border-l bg-gray-50 p-4 flex flex-col h-full overflow-y-auto">
        {/* Score Overview */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-medium text-gray-800">Current Grade</h3>
            <div className="text-sm font-medium text-gray-600">IELTS Writing</div>
          </div>
          
          <div className="flex items-center mb-4">
            <div className="relative mr-4">
              <CircularProgress percentage={grade} />
            </div>
            
            <div className="space-y-2 flex-1">
              {submissionStatus === 'success' && (
                <>
                  <CompactScoreIndicator 
                    score={taskAchievementAnalysis?.band_score || 0} 
                    maxScore={9}
                    label="Task Achievement" 
                    onClick={() => setActiveModal('task')}
                  />
                  <CompactScoreIndicator 
                    score={grammarAnalysis?.overall_score || 0} 
                    maxScore={9}
                    label="Grammar" 
                    onClick={() => setActiveModal('grammar')}
                  />
                  <CompactScoreIndicator 
                    score={lexicalAnalysis?.overall_score || 0} 
                    maxScore={9}
                    label="Vocabulary" 
                    onClick={() => setActiveModal('vocabulary')}
                  />
                <CompactScoreIndicator 
                score={coherenceAnalysis?.overall_score || 0} 
                maxScore={9}
                label="Coherence" 
                onClick={() => setActiveModal('coherence')}
              />

                </>
              )}
            </div>
          </div>
        </div>
        
        {submissionStatus === 'success' && (
          <>
            {/* Word Count Summary */}
            <div className="bg-white rounded-lg p-3 mb-5 border border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {FeedbackIcons.wordCount}
                  <h3 className="text-sm font-medium text-gray-700 ml-2">Word Count</h3>
                </div>
                <span className="font-medium text-sm">{wordCount}</span>
              </div>
              {!meetsWordRequirement && (
                <div className="mt-1 text-sm text-red-600 flex items-center">
                  {FeedbackIcons.warning}
                  <span className="ml-1">Needs {Math.abs(wordCountDifference)} more words</span>
                </div>
              )}
            </div>
            
            {/* Key Improvements Section */}
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Key Improvements</h3>
              {getKeyImprovements().map((improvement, index) => (
                <KeyImprovementItem 
                  key={index} 
                  text={improvement.text} 
                  priority={improvement.priority} 
                />
              ))}
            </div>
            
            {/* Area Summaries */}
            <h3 className="text-sm font-medium text-gray-700 mb-2">Assessment Areas</h3>
            
            <FeedbackSummaryCard
              title="Task Achievement"
              summary={`Score: ${taskAchievementAnalysis?.band_score.toFixed(1)}/9. ${taskAchievementAnalysis?.feedback?.improvements?.[0] || "Click for details."}`}
              onClick={() => setActiveModal('task')}
              icon={FeedbackIcons.task}
              color="blue"
            />
            
            <FeedbackSummaryCard
              title="Grammar & Sentence Structure"
              summary={`Score: ${grammarAnalysis?.overall_score.toFixed(1)}/9. ${grammarAnalysis?.feedback?.split('.')[0] || "Click for details."}.`}
              onClick={() => setActiveModal('grammar')}
              icon={FeedbackIcons.grammar}
              color="green"
            />
            
            <FeedbackSummaryCard
              title="Vocabulary & Word Choice"
              summary={`Score: ${lexicalAnalysis?.overall_score.toFixed(1)}/9. ${lexicalAnalysis?.feedback?.improvements?.[0] || "Click for details."}`}
              onClick={() => setActiveModal('vocabulary')}
              icon={FeedbackIcons.vocabulary}
              color="amber"
            />
            <FeedbackSummaryCard
        title="Coherence & Cohesion"
        summary={`Score: ${coherenceAnalysis?.overall_score.toFixed(1)}/9. ${coherenceAnalysis?.feedback?.[0] || "Click for details."}.`}
        onClick={() => setActiveModal('coherence')}
        icon={FeedbackIcons.vocabulary}  // You'll need to add this to FeedbackIcons
        color="purple"
      />
          </>
        )}
        
        {/* Progress Section */}
        <div className="mt-4 mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Progress</h3>
          <div className="flex flex-col gap-2">
            {questions.map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full ${
                    index < 3 ? 'bg-purple-500' : 'bg-gray-300'
                  }`}
                />
                <span className="text-sm text-gray-600">Question {step}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-auto pt-4">
          <div className="space-y-2">
            {submissionStatus === 'success' && (
              <div className="text-sm text-green-600 text-center mb-2">
                Submission successful! You can continue editing if needed.
              </div>
            )}
            <button
              onClick={handleSubmit}
              className={`w-full px-6 py-2 text-white rounded-lg transition-all duration-300 
                ${submissionStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {submissionStatus === 'success' ? 'Update Submission' : 'Submit'}
            </button>
          </div>
          <button
            onClick={() => setIsWritingMode(false)}
            className="w-full px-4 py-2 mt-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
      
      {/* Add modals manager to handle detailed feedback popups */}
      <FeedbackModalsManager
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        taskAchievementAnalysis={taskAchievementAnalysis}
        grammarAnalysis={grammarAnalysis}
        lexicalAnalysis={lexicalAnalysis}
        coherenceAnalysis={coherenceAnalysis}
      />
    </>
  );
};

WritingSidebar.propTypes = {
  grade: PropTypes.number.isRequired,
  submissionStatus: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired,
  setIsWritingMode: PropTypes.func.isRequired,
  grammarAnalysis: PropTypes.shape({
    overall_score: PropTypes.number,
    raw_score: PropTypes.number,
    sentence_analysis: PropTypes.arrayOf(
      PropTypes.shape({
        sentence: PropTypes.string,
        score: PropTypes.number
      })
    ),
    feedback: PropTypes.string
  }),
  lexicalAnalysis: PropTypes.shape({
    overall_score: PropTypes.number,
    component_scores: PropTypes.object,
    feedback: PropTypes.shape({
      general_feedback: PropTypes.arrayOf(PropTypes.string),
      strengths: PropTypes.arrayOf(PropTypes.string),
      improvements: PropTypes.arrayOf(PropTypes.string),
      detailed_suggestions: PropTypes.object
    })
  }),
  coherenceAnalysis: PropTypes.shape({
    overall_score: PropTypes.number,
    improvements: PropTypes.arrayOf(PropTypes.string),
    feedback: PropTypes.string
  }),
  taskAchievementAnalysis: PropTypes.shape({
    band_score: PropTypes.number,
    component_scores: PropTypes.object,
    detailed_analysis: PropTypes.shape({
      word_count_analysis: PropTypes.shape({
        word_count: PropTypes.number,
        meets_requirement: PropTypes.bool,
        difference: PropTypes.number
      }),
      structure_analysis: PropTypes.object,
      content_analysis: PropTypes.object
    }),
    feedback: PropTypes.shape({
      strengths: PropTypes.arrayOf(PropTypes.string),
      improvements: PropTypes.arrayOf(PropTypes.string),
      specific_suggestions: PropTypes.objectOf(
        PropTypes.arrayOf(PropTypes.string)
      )
    }),
    coherenceAnalysis: PropTypes.shape({
      overall_score: PropTypes.number,
      improvements: PropTypes.arrayOf(PropTypes.string),
      feedback: PropTypes.string
    })
  })
};

export default WritingSidebar;