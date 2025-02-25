import React from 'react';
import PropTypes from 'prop-types';

const GrammarDetailsContent = ({ grammarAnalysis }) => {
  if (!grammarAnalysis) return null;
  
  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Overall Score</h3>
        <div className="p-4 bg-green-50 rounded-lg border border-green-100 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-green-800 font-medium">Grammar Score</span>
            <span className="text-green-800 font-bold">{grammarAnalysis.overall_score.toFixed(1)}/9.0</span>
          </div>
          <div className="w-full bg-green-200 rounded-full h-2 mt-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${(grammarAnalysis.overall_score / 9) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Grammar Feedback */}
      {grammarAnalysis.feedback && (
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Grammar Feedback</h3>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-blue-800">{grammarAnalysis.feedback}</p>
          </div>
        </div>
      )}
      
      {/* Sentence Analysis */}
      {grammarAnalysis.sentence_analysis && grammarAnalysis.sentence_analysis.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Sentence Analysis</h3>
          {grammarAnalysis.sentence_analysis.map((sentence, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">Sentence {index + 1}</span>
                <span className="text-sm font-semibold">
                  {(sentence.score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div 
                  className={`h-2 rounded-full ${
                    sentence.score > 0.8 ? 'bg-green-500' : 
                    sentence.score > 0.6 ? 'bg-blue-500' : 
                    sentence.score > 0.4 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${sentence.score * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 italic border-l-2 border-gray-300 pl-3">{sentence.sentence}</p>
            </div>
          ))}
        </div>
      )}
      
      {/* Grammar Improvement Tips */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Grammar Improvement Tips</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="font-medium text-blue-800 mb-2">Sentence Structure</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
              <li>Use a mix of simple, compound, and complex sentences to improve variety</li>
              <li>Ensure proper use of conjunctions (and, but, or, so, because, etc.)</li>
              <li>Vary your sentence length to create rhythm in your writing</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="font-medium text-blue-800 mb-2">Grammar Rules</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
              <li>Ensure subject-verb agreement in all sentences</li>
              <li>Use appropriate tenses consistently throughout your writing</li>
              <li>Pay attention to article usage (a, an, the) with nouns</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

GrammarDetailsContent.propTypes = {
  grammarAnalysis: PropTypes.shape({
    overall_score: PropTypes.number.isRequired,
    raw_score: PropTypes.number,
    feedback: PropTypes.string,
    sentence_analysis: PropTypes.arrayOf(
      PropTypes.shape({
        sentence: PropTypes.string.isRequired,
        score: PropTypes.number.isRequired
      })
    )
  }).isRequired
};

export default GrammarDetailsContent;