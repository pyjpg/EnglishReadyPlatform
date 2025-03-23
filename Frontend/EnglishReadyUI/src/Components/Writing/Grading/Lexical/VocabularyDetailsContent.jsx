import React from 'react';
import PropTypes from 'prop-types';

const VocabularyFeedback = ({ lexicalAnalysis }) => {
  if (!lexicalAnalysis) return null;
  
  // Destructure for easier access
  const { 
    overall_score, 
    component_scores, 
    detailed_analysis,
    feedback 
  } = lexicalAnalysis;
  
  // Calculate IELTS band equivalent (approximation)
  const getIeltsBand = (score) => {
    if (score >= 8) return "Band 8-9 (Expert)";
    if (score >= 6.5) return "Band 7-7.5 (Good)";
    if (score >= 5) return "Band 5.5-6 (Competent)";
    if (score >= 3.5) return "Band 4-5 (Modest)";
    return "Band 3-3.5 (Limited)";
  };
  
  // Render specific improvement strategies based on user's weaknesses
  const renderImprovementStrategies = () => {
    const strategies = [];
    
    // Low academic language score
    if (component_scores?.academic_usage < 4) {
      strategies.push({
        title: "Enhancing Academic Vocabulary",
        tips: [
          "Replace common words with academic alternatives (e.g., 'show' → 'demonstrate', 'big' → 'significant')",
          "Incorporate relevant field-specific terminology where appropriate",
          "Use formal linking expressions instead of simple connectors (e.g., 'so' → 'consequently')"
        ]
      });
    }
    
    // Low word sophistication
    if (component_scores?.word_sophistication < 4) {
      strategies.push({
        title: "Increasing Lexical Sophistication",
        tips: [
          "Replace basic verbs with more precise alternatives (e.g., 'make' → 'construct', 'develop', 'formulate')",
          "Use specific adjectives instead of general ones (e.g., 'good' → 'beneficial', 'advantageous')",
          "Consider using well-placed adverbs to add nuance (e.g., 'significantly', 'ostensibly')"
        ]
      });
    }
    
    // Repeated words detected
    if (detailed_analysis?.lexical_diversity?.repeated_words?.length > 0) {
      strategies.push({
        title: "Reducing Word Repetition",
        tips: [
          "Use synonyms to avoid repeating key terms",
          "Employ pronouns and referential phrases where appropriate",
          "Restructure sentences to eliminate unnecessary repetition"
        ]
      });
    }
    
    // Default if no specific issues found
    if (strategies.length === 0) {
      strategies.push({
        title: "Further Enhancing Your Vocabulary",
        tips: [
          "Continue expanding your academic word knowledge through topic-specific reading",
          "Practice using a wider range of linking phrases and transitions",
          "Consider using more nuanced vocabulary to express complex ideas"
        ]
      });
    }
    
    return strategies;
  };
  
  // Get improvement examples based on the specific text
  const getPersonalizedExamples = () => {
    const examples = [];
    
    // Add examples for repeated words
    if (detailed_analysis?.lexical_diversity?.repeated_words?.length > 0) {
      detailed_analysis.lexical_diversity.repeated_words.forEach(word => {
        // Get alternative suggestions from detailed_suggestions if available
        const alternatives = feedback?.detailed_suggestions?.sentence_structure?.suggestions?.linking_phrases?.[word] || 
                            ["more varied alternatives", "synonyms", "different phrasing"];
        
        examples.push({
          type: "repetition",
          word,
          alternatives: alternatives.slice(0, 3) // Limit to 3 alternatives
        });
      });
    }
    
    // Add examples for simple sentences that could be improved
    if (detailed_analysis?.sentence_structure?.short_sentences?.length > 0) {
      detailed_analysis.sentence_structure.short_sentences.forEach(sentence => {
        examples.push({
          type: "simple_sentence",
          sentence,
          suggestion: "Consider expanding this with additional details or combining with related ideas"
        });
      });
    }
    
    return examples;
  };
  
  const personalizedExamples = getPersonalizedExamples();
  const improvementStrategies = renderImprovementStrategies();
  
  return (
    <div className="space-y-6">
      {/* Overall Score Section */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Vocabulary Assessment</h3>
        </div>
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Score Display */}
            <div className="flex-1 p-4 bg-amber-50 rounded-lg border border-amber-100">
              <div className="mb-1 text-amber-800 font-medium">Score</div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-amber-800">{overall_score.toFixed(1)}</span>
                <span className="text-amber-600 text-sm mb-1">/9.0</span>
              </div>
              <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-amber-600 h-2 rounded-full" 
                  style={{ width: `${(overall_score / 9) * 100}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-amber-700">
                Equivalent to approximately {getIeltsBand(overall_score)}
              </div>
            </div>
            
            {/* Key Metrics */}
            <div className="flex-1 grid grid-cols-2 gap-2">
              {component_scores && Object.entries(component_scores).map(([key, value]) => {
                const label = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                const colorClass = value > 7 ? 'bg-emerald-500' : 
                                  value > 5 ? 'bg-blue-500' : 
                                  value > 3 ? 'bg-amber-500' : 'bg-red-500';
                
                return (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">{label}</div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="h-2 w-full bg-gray-200 rounded-full">
                        <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${(value / 9) * 100}%` }} />
                      </div>
                      <span className="ml-2 text-sm font-medium">{typeof value === 'number' ? value.toFixed(1) : value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Lexical Stats */}
          {detailed_analysis?.lexical_diversity && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
                <div className="text-xs text-gray-500 mb-1">Total Words</div>
                <div className="text-xl font-medium text-gray-800">{detailed_analysis.lexical_diversity.total_words}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
                <div className="text-xs text-gray-500 mb-1">Unique Words</div>
                <div className="text-xl font-medium text-gray-800">{detailed_analysis.lexical_diversity.unique_words}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
                <div className="text-xs text-gray-500 mb-1">Diversity Ratio</div>
                <div className="text-xl font-medium text-gray-800">
                  {detailed_analysis.lexical_diversity.diversity_ratio.toFixed(2)}
                  <span className="text-xs text-gray-500 ml-1">
                    ({Math.round(detailed_analysis.lexical_diversity.diversity_ratio * 100)}%)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Strengths & Areas for Improvement */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Personalized Feedback</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <h4 className="font-medium text-emerald-800 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Your Strengths
              </h4>
              <ul className="space-y-2">
                {feedback?.strengths?.length > 0 ? (
                  feedback.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-emerald-700 flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                      </svg>
                      {strength}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-emerald-700">
                    You've demonstrated good vocabulary usage overall.
                  </li>
                )}
              </ul>
            </div>
            
            {/* Areas for Improvement */}
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
              <h4 className="font-medium text-amber-800 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Areas for Improvement
              </h4>
              <ul className="space-y-2">
                {feedback?.improvements?.length > 0 ? (
                  feedback.improvements.map((improvement, index) => (
                    <li key={index} className="text-sm text-amber-700 flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {improvement}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-amber-700">
                    Consider further expanding your vocabulary range.
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          {/* Personalized Examples */}
          {personalizedExamples.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2">Specific Examples from Your Text</h4>
              <ul className="space-y-3">
                {personalizedExamples.map((example, index) => (
                  <li key={index} className="text-sm">
                    {example.type === 'repetition' ? (
                      <div>
                        <span className="font-medium text-blue-700">Repeated word: </span>
                        <span className="px-1.5 py-0.5 bg-blue-100 rounded text-blue-800 font-medium">{example.word}</span>
                        <div className="mt-1 ml-4">
                          <span className="text-blue-700">Consider alternatives: </span>
                          <span className="text-blue-600">{example.alternatives.join(', ')}</span>
                        </div>
                      </div>
                    ) : example.type === 'simple_sentence' ? (
                      <div>
                        <span className="font-medium text-blue-700">Simple sentence: </span>
                        <span className="px-1.5 py-0.5 bg-blue-100 rounded text-blue-800 italic">"{example.sentence}"</span>
                        <div className="mt-1 ml-4 text-blue-600">{example.suggestion}</div>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* Improvement Strategies */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Personalized Strategies</h3>
        </div>
        <div className="p-4 grid grid-cols-1 gap-4">
          {improvementStrategies.map((strategy, index) => (
            <div key={index} className="p-4 bg-amber-50 rounded-lg border border-amber-100">
              <h4 className="font-medium text-amber-800 mb-2">{strategy.title}</h4>
              <ul className="list-disc pl-5 space-y-1">
                {strategy.tips.map((tip, tipIndex) => (
                  <li key={tipIndex} className="text-sm text-amber-700">{tip}</li>
                ))}
              </ul>
            </div>
          ))}
          
          {/* Academic Word Suggestions */}
          {feedback?.detailed_suggestions?.academic_language?.suggestions?.linking_phrases && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2">Recommended Academic Linking Phrases</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(feedback.detailed_suggestions.academic_language.suggestions.linking_phrases).map(([category, phrases]) => (
                  <div key={category} className="p-3 bg-white rounded border border-blue-100">
                    <h5 className="text-xs font-medium text-blue-700 mb-1 uppercase">
                      {category.split('_').join(' ')}
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {phrases.map((phrase, phraseIndex) => (
                        <span key={phraseIndex} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                          {phrase}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Academic Language Section - Conditional Rendering */}
      {detailed_analysis?.academic_language && (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">Academic Language Profile</h3>
          </div>
          <div className="p-4">
            <div className="flex items-center mb-3">
              <div className="mr-4 text-center">
                <div className="text-xs text-gray-500 mb-1">Academic Words</div>
                <div className="text-2xl font-medium text-gray-800">
                  {detailed_analysis.academic_language.academic_words_count}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Academic Word Ratio</span>
                  <span>{Math.round(detailed_analysis.academic_language.academic_ratio * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${detailed_analysis.academic_language.academic_ratio * 100}%` }}
                  />
                </div>
              </div>
            </div>
            
            {detailed_analysis.academic_language.academic_words_used && 
             detailed_analysis.academic_language.academic_words_used.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-600 mb-2">Academic Words Used</h5>
                <div className="flex flex-wrap gap-2">
                  {detailed_analysis.academic_language.academic_words_used.map((word, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-50 text-blue-800 text-xs rounded-full">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

VocabularyFeedback.propTypes = {
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

export default VocabularyFeedback;