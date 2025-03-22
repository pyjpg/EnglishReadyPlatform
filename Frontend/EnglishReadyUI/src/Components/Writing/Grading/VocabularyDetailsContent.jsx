import React from 'react';
import PropTypes from 'prop-types';
import LexicalFeedback from './LexicalFeedback';


const VocabularyDetailsContent = ({ lexicalAnalysis, ieltsScore }) => {
  
  console.log(lexicalAnalysis);  
  if (!lexicalAnalysis) return null;

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Overall Score</h3>
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-amber-800 font-medium">Vocabulary Score</span>
            <span className="text-amber-800 font-bold">{lexicalAnalysis.overall_score.toFixed(1)}/9.0</span>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
            <div 
              className="bg-amber-600 h-2 rounded-full" 
              style={{ width: `${(lexicalAnalysis.overall_score / 9) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Component Scores */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Component Scores</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {lexicalAnalysis.component_scores && Object.entries(lexicalAnalysis.component_scores).map(([key, value]) => (
            <div key={key} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">
                {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </div>
              <div className="flex justify-between items-center mb-1">
                <div className="h-2 w-full bg-gray-200 rounded-full">
                  <div 
                    className={`h-2 rounded-full ${
                      value > 7 ? 'bg-green-500' : 
                      value > 5 ? 'bg-blue-500' : 
                      value > 3 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(value / 9) * 100}%` }}
                  />
                </div>
                <span className="ml-2 text-sm font-medium">{typeof value === 'number' ? value.toFixed(1) : value}/9.0</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Detailed Analysis */}
      {lexicalAnalysis.detailed_analysis && (
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Detailed Analysis</h3>
          
          {/* Lexical Diversity */}
          {lexicalAnalysis.detailed_analysis.lexical_diversity && (
            <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">Lexical Diversity</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-2 bg-gray-50 rounded border border-gray-100">
                  <div className="text-xs text-gray-500">Total Words</div>
                  <div className="text-lg font-medium">{lexicalAnalysis.detailed_analysis.lexical_diversity.total_words}</div>
                </div>
                <div className="p-2 bg-gray-50 rounded border border-gray-100">
                  <div className="text-xs text-gray-500">Unique Words</div>
                  <div className="text-lg font-medium">{lexicalAnalysis.detailed_analysis.lexical_diversity.unique_words}</div>
                </div>
                <div className="p-2 bg-gray-50 rounded border border-gray-100">
                  <div className="text-xs text-gray-500">Diversity Ratio</div>
                  <div className="text-lg font-medium">{lexicalAnalysis.detailed_analysis.lexical_diversity.diversity_ratio.toFixed(2)}</div>
                </div>
              </div>
              
              {lexicalAnalysis.detailed_analysis.lexical_diversity.repeated_words && 
               lexicalAnalysis.detailed_analysis.lexical_diversity.repeated_words.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-600 mb-1">Frequently Repeated Words</h5>
                  <div className="flex flex-wrap gap-2">
                    {lexicalAnalysis.detailed_analysis.lexical_diversity.repeated_words.map((word, index) => (
                      <span key={index} className="px-2 py-1 bg-amber-50 text-amber-800 text-xs rounded-full">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Academic Language */}
          {lexicalAnalysis.detailed_analysis.academic_language && (
            <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">Academic Language</h4>
              <div className="flex items-center mb-3">
                <div className="mr-3">
                  <div className="text-xs text-gray-500">Academic Words</div>
                  <div className="text-lg font-medium">{lexicalAnalysis.detailed_analysis.academic_language.academic_words_count}</div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">Academic Ratio</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${lexicalAnalysis.detailed_analysis.academic_language.academic_ratio * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {lexicalAnalysis.detailed_analysis.academic_language.academic_words_used && 
               lexicalAnalysis.detailed_analysis.academic_language.academic_words_used.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-600 mb-1">Academic Words Used</h5>
                  <div className="flex flex-wrap gap-2">
                    {lexicalAnalysis.detailed_analysis.academic_language.academic_words_used.map((word, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 text-blue-800 text-xs rounded-full">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Vocabulary Feedback */}
      {lexicalAnalysis.feedback && (
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Feedback & Suggestions</h3>
          <LexicalFeedback feedback={lexicalAnalysis.feedback} expanded={true} />
        </div>
      )}
      
      {/* Vocabulary Tips */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Vocabulary Improvement Tips</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
            <h4 className="font-medium text-amber-800 mb-2">Enhancing Academic Language</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-amber-700">
              <li>Replace everyday words with more formal alternatives (e.g., "good" → "beneficial")</li>
              <li>Use discipline-specific terminology relevant to your topic</li>
              <li>Include appropriate transition words to connect ideas (moreover, furthermore, consequently)</li>
            </ul>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
            <h4 className="font-medium text-amber-800 mb-2">Avoiding Repetition</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-amber-700">
              <li>Use synonyms to avoid repeating the same words</li>
              <li>Use pronouns (it, they, these) appropriately to refer back to nouns</li>
              <li>Restructure sentences when necessary to avoid repetitive patterns</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

VocabularyDetailsContent.propTypes = {
  lexicalAnalysis: PropTypes.shape({
    overall_score: PropTypes.number.isRequired,
    component_scores: PropTypes.object,
    detailed_analysis: PropTypes.object,
    feedback: PropTypes.shape({
      general_feedback: PropTypes.arrayOf(PropTypes.string),
      strengths: PropTypes.arrayOf(PropTypes.string),
      improvements: PropTypes.arrayOf(PropTypes.string),
      detailed_suggestions: PropTypes.object
    })
  }).isRequired
};

export default VocabularyDetailsContent;