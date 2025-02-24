import React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from './CircularProgress';
import LexicalFeedback from './LexicalFeedback';

const FeedbackCard = ({ title, content, type = 'info' }) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700'
  };

  return (
    <div className={`p-4 rounded-lg border ${styles[type]} mb-4`}>
      <h5 className="font-medium mb-2 text-sm">{title}</h5>
      <p className="text-sm opacity-90">{content}</p>
    </div>
  );
};

const ComponentScores = ({ scores }) => (
  <div className="space-y-3 mb-4">
    {Object.entries(scores).map(([key, score]) => (
      <div key={key} className="text-sm">
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">
            {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </span>
          <span className="font-medium">{score.toFixed(1)}/9.0</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-blue-600 h-1.5 rounded-full" 
            style={{ width: `${(score/9) * 100}%` }}
          />
        </div>
      </div>
    ))}
  </div>
);

const SentenceAnalysis = ({ sentences }) => (
  <div className="space-y-3 mb-4">
    {sentences.map((sentence, index) => (
      <div key={index} className="text-sm">
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Sentence {index + 1}</span>
          <span className="font-medium">{(sentence.score * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-blue-600 h-1.5 rounded-full" 
            style={{ width: `${sentence.score * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{sentence.sentence}</p>
      </div>
    ))}
  </div>
);

const WritingSidebar = ({ 
  grade, 
  submissionStatus, 
  handleSubmit, 
  setIsWritingMode, 
  grammarAnalysis,
  lexicalAnalysis 
}) => {
  const questions = [1, 2, 3, 4, 5, 6];

  return (
    <div className="w-72 border-l bg-gray-50 p-6 flex flex-col h-full overflow-y-auto">
      <div className="mb-8">
        <h4 className="text-sm font-medium text-gray-500 mb-2">Current Grade</h4>
        <CircularProgress percentage={grade} />
      </div>

      {submissionStatus === 'success' && grammarAnalysis && lexicalAnalysis && (
        <>
          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-500 mb-4">Grammar Analysis</h4>
            
            <FeedbackCard
              title="Overall Grammar Score"
              content={`${grammarAnalysis.overall_score.toFixed(1)}/9.0 on the IELTS scale`}
              type="success"
            />
            
            <FeedbackCard
              title="Grammar Feedback"
              content={grammarAnalysis.feedback}
              type="info"
            />
            
            <h5 className="text-sm font-medium text-gray-500 mt-6 mb-3">
              Sentence Grammar Analysis
            </h5>
            
            <SentenceAnalysis sentences={grammarAnalysis.sentence_analysis} />
          </div>

          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-500 mb-4">Vocabulary Analysis</h4>
            
            <FeedbackCard
              title="Overall Vocabulary Score"
              content={`${lexicalAnalysis.overall_score.toFixed(1)}/9.0 on the IELTS scale`}
              type={lexicalAnalysis.overall_score >= 7 ? 'success' : 'warning'}
            />
            
            <h5 className="text-sm font-medium text-gray-500 mt-6 mb-3">
              Component Scores
            </h5>
            
            <ComponentScores scores={lexicalAnalysis.component_scores} />
            
            <h5 className="text-sm font-medium text-gray-500 mt-6 mb-3">
              Detailed Feedback
            </h5>
            
            {/* Pass the feedback object directly to LexicalFeedback */}
            <LexicalFeedback feedback={lexicalAnalysis.feedback} />
          </div>
        </>
      )}

      <div className="mb-8">
        <h4 className="text-sm font-medium text-gray-500 mb-4">Progress</h4>
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

      <div className="mt-auto">
        <div className="space-y-2">
          {submissionStatus === 'success' && (
            <div className="text-sm text-green-600 text-center">
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
  })
};

export default WritingSidebar;