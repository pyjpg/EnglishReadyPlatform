import React from 'react';
import PropTypes from 'prop-types';

const GrammarDetailsContent = ({ grammarAnalysis, ieltsScore }) => {
  console.log(grammarAnalysis);
  if (!grammarAnalysis) return null;

  // Color scoring system
  const getScoreColor = (score) => {
    if (score >= 8) return 'green';
    if (score >= 7) return 'blue';
    if (score >= 6) return 'amber';
    return 'red';
  };

  // Sentence strength evaluation
  const getSentenceStrength = (score) => {
    if (score > 0.9) return 'Excellent';
    if (score > 0.8) return 'Very Good';
    if (score > 0.7) return 'Good';
    if (score > 0.6) return 'Satisfactory';
    return 'Needs Improvement';
  };

  // Dynamic improvement tips based on score
  const getImprovementTips = (score) => {
    if (score >= 8) return [
      "Focus on mastering complex grammatical structures for higher proficiency",
      "Refine use of advanced punctuation like semicolons and em dashes",
      "Practice stylistic variations to enhance academic tone"
    ];
    if (score >= 7) return [
      "Review consistent tense usage across paragraphs",
      "Work on reducing minor article (a/an/the) errors",
      "Practice using relative clauses for more complex sentences"
    ];
    if (score >= 6) return [
      "Focus on subject-verb agreement in complex sentences",
      "Improve comma usage in compound and complex sentences",
      "Practice using correct prepositions in common phrases"
    ];
    return [
      "Master basic sentence structure and word order",
      "Focus on correct use of simple past and present perfect tenses",
      "Practice forming complete sentences with clear subjects and verbs"
    ];
  };

  // Get specific practice tips based on error category
  const getCategoryPracticeTips = (category) => {
    const tips = {
      'TYPOS': [
        "Use spell check tools before submitting your work",
        "Keep a list of frequently misspelled words",
        "Practice typing exercises to improve accuracy",
        "Read your text aloud to catch spelling errors",
        "Study common English spelling patterns"
      ],
      'GRAMMAR': [
        "Study subject-verb agreement rules",
        "Practice identifying and correcting verb tense errors",
        "Learn proper article usage with different nouns",
        "Review rules for singular and plural nouns",
        "Practice forming complex sentences correctly"
      ],
      'PUNCTUATION': [
        "Learn when to use commas in complex sentences",
        "Practice using semicolons to join related clauses",
        "Study proper apostrophe usage for possessives",
        "Review rules for quotation marks in academic writing",
        "Learn when to use colons and dashes effectively"
      ],
      'CASING': [
        "Review capitalization rules for proper nouns",
        "Practice capitalizing sentence beginnings consistently",
        "Learn capitalization rules for titles and headings",
        "Check for inconsistent capitalization in your writing",
        "Study capitalization in formal academic writing"
      ],
      'COLLOCATIONS': [
        "Read authentic materials to expose yourself to natural word combinations",
        "Create a personal collocation dictionary",
        "Practice using common verb + noun combinations",
        "Study adjective + noun collocations in academic contexts",
        "Learn adverb + adjective combinations for formal writing"
      ],
      'STYLE': [
        "Vary your sentence structures for better readability",
        "Practice using more sophisticated transitions",
        "Learn to avoid redundancy in your writing",
        "Study academic vocabulary to enhance your style",
        "Practice conciseness without losing meaning"
      ]
    }
    
    return tips[category] || [
      `Study rules related to ${category.toLowerCase()}`,
      "Review example sentences with correct usage",
      "Practice with exercises targeting this specific area"
    ];
  };

  // Get description for error category
  const getErrorCategoryDescription = (category) => {
    const descriptions = {
      'GRAMMAR': 'Grammar errors include issues with sentence structure, verb forms, and word order.',
      'TYPOS': 'Typos are spelling mistakes that can affect readability and comprehension.',
      'PUNCTUATION': 'Punctuation errors include missing or incorrect commas, periods, and other marks.',
      'STYLE': 'Style issues don\'t affect correctness but can improve clarity and flow.',
      'CASING': 'Casing errors involve incorrect capitalization of words.',
      'COLLOCATIONS': 'Collocation errors involve incorrect word combinations that native speakers wouldn\'t use.',
      'OTHER': 'Miscellaneous language issues that don\'t fit into other categories.'
    };
    return descriptions[category] || `Issues related to ${category.toLowerCase()}`;
  };

  // Extract values from grammar analysis
  const { 
    overall_score, 
    feedback, 
    error_details = [], 
    error_categories = {}, 
    sentence_analysis = [],
    raw_score = 0,
    error_rate = 0
  } = grammarAnalysis;
  
  const ieltsColor = getScoreColor(ieltsScore);
  const grammarColor = getScoreColor(overall_score);

  // Sort error categories by frequency for display
  const sortedErrorCategories = Object.entries(error_categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Top 5 categories
    
  // Get the dominant error category
  const dominantErrorCategory = sortedErrorCategories.length > 0 ? sortedErrorCategories[0][0] : null;
  
  // Group errors by type
  const errorsByType = {};
  error_details.forEach(error => {
    if (!errorsByType[error.category]) {
      errorsByType[error.category] = [];
    }
    errorsByType[error.category].push(error);
  });

  // Calculate error density (errors per sentence)
  const errorDensity = sentence_analysis.length > 0 
    ? (error_details.length / sentence_analysis.length).toFixed(1) 
    : 0;

  // Count sentences with severe issues (score < 0.6)
  const severeIssueCount = sentence_analysis.filter(s => s.score < 0.6).length;
  const sentenceIssuePercentage = sentence_analysis.length > 0 
    ? Math.round((severeIssueCount / sentence_analysis.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Score Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-5 rounded-lg border bg-${grammarColor}-50 border-${grammarColor}-200 shadow-sm`}>
          <h3 className={`text-${grammarColor}-800 font-semibold text-lg mb-2`}>
            Grammar Score
          </h3>
          <div className="flex items-center">
            <span className={`text-3xl font-bold text-${grammarColor}-600`}>
              {overall_score.toFixed(1)}
            </span>
            <span className="text-gray-500 ml-2">/ 9.0</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Based on IELTS grammatical range and accuracy criteria
          </p>
        </div>
        
        <div className={`p-5 rounded-lg border bg-${ieltsColor}-50 border-${ieltsColor}-200 shadow-sm`}>
          <h3 className={`text-${ieltsColor}-800 font-semibold text-lg mb-2`}>
            Overall IELTS Score
          </h3>
          <div className="flex items-center">
            <span className={`text-3xl font-bold text-${ieltsColor}-600`}>
              {ieltsScore.toFixed(1)}
            </span>
            <span className="text-gray-500 ml-2">/ 9.0</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Estimated band score based on all criteria
          </p>
        </div>
      </div>

      {/* Quick Summary - NEW */}
      <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-gray-800 font-semibold text-lg mb-3">
          Quick Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-xl font-bold text-gray-800 mb-1">
              {error_details.length}
            </div>
            <div className="text-sm text-gray-600">
              Total Errors Detected
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-xl font-bold text-gray-800 mb-1">
              {errorDensity}
            </div>
            <div className="text-sm text-gray-600">
              Errors Per Sentence
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-xl font-bold text-gray-800 mb-1">
              {sentenceIssuePercentage}%
            </div>
            <div className="text-sm text-gray-600">
              Sentences with Major Issues
            </div>
          </div>
        </div>
      </div>

      {/* Specific Error Categories Section */}
      {sortedErrorCategories.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-gray-800 font-semibold text-lg">
              Error Breakdown
            </h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Error category distribution */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Error Categories</h4>
                <div className="space-y-3">
                  {sortedErrorCategories.map(([category, count], index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{category}</span>
                        <span className="text-sm text-gray-600">{count} errors</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-500'}`}
                          style={{ width: `${(count / sortedErrorCategories[0][1]) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {getErrorCategoryDescription(category)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specific error examples */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Common Errors</h4>
                {error_details.length > 0 ? (
                  <div className="space-y-3">
                    {error_details.slice(0, 3).map((error, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-100 rounded-md">
                        <div className="flex items-start">
                          <div className="text-red-500 mr-2">⚠️</div>
                          <div className="w-full">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">{error.category}: </span>
                              {error.message}
                            </p>
                            <div className="mt-1 p-2 bg-white rounded border border-red-100 text-sm">
                              <p className="text-gray-500">Context:</p>
                              <p className="text-gray-700 mt-1 font-mono">"{error.context}"</p>
                            </div>
                            {error.suggestion && (
                              <p className="text-xs text-green-600 mt-1">
                                <span className="font-medium">Suggestion: </span>{error.suggestion}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {error_details.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        + {error_details.length - 3} more errors
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No specific errors to display.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personalized Feedback Section */}
      <div className="p-5 bg-blue-50 rounded-lg border border-blue-100 shadow-sm">
        <h3 className="text-blue-800 font-semibold text-lg mb-3 flex items-center">
          <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Your Personal Feedback
        </h3>
        <div className="border-l-4 border-blue-300 pl-4 space-y-3">
          {feedback && (
            typeof feedback === 'string' ? (
              feedback.split('. ').map((point, i) => (
                point.trim() && (
                  <p key={i} className="text-blue-800">
                    {point.replace(/\.$/, '')}.
                  </p>
                )
              ))
            ) : (
              <p className="text-blue-800 italic">{feedback}</p>
            )
          )}
          
          {/* Add score-based additional feedback */}
          {overall_score < 5 && (
            <p className="text-blue-800 mt-2">
              Your writing shows numerous grammatical issues that impact understanding. Consider focusing on fundamental grammar and spelling rules before moving to more complex writing.
            </p>
          )}
          {overall_score >= 5 && overall_score < 7 && (
            <p className="text-blue-800 mt-2">
              Your grammar is functional but inconsistent. With targeted practice on problem areas, you could significantly improve your score.
            </p>
          )}
          {overall_score >= 7 && (
            <p className="text-blue-800 mt-2">
              You demonstrate good command of grammar with occasional lapses. Focus on refining specific error patterns to achieve excellence.
            </p>
          )}
        </div>
      </div>

      {/* Focus Area Based on Dominant Error Type - NEW */}
      {dominantErrorCategory && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-gray-800 font-semibold text-lg">
              Focus Area: {dominantErrorCategory}
            </h3>
          </div>
          <div className="p-4">
            <p className="text-gray-700 mb-4">
              {dominantErrorCategory === 'TYPOS' ? 
                `Your writing shows a pattern of spelling issues. Spelling errors make up ${sortedErrorCategories[0][1]} of your total errors.` : 
                `Your writing shows a pattern of ${dominantErrorCategory.toLowerCase()} issues. ${dominantErrorCategory} errors make up ${sortedErrorCategories[0][1]} of your total errors.`}
            </p>
            
            <h4 className="font-medium text-gray-700 mb-2">Practice Tips:</h4>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              {getCategoryPracticeTips(dominantErrorCategory).slice(0, 3).map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
            
            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-md">
              <h4 className="font-medium text-amber-800 mb-1">Resources for Improvement:</h4>
              <p className="text-amber-800 text-sm">
                {dominantErrorCategory === 'TYPOS' ? 
                  "Use a spell-checker and proofread your work carefully. Consider using dictation software to practice spelling common words." : 
                  `Consider using grammar reference materials focused on ${dominantErrorCategory.toLowerCase()}. Practice exercises targeting this specific area will help you improve quickly.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Sentence Analysis */}
      {sentence_analysis.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-gray-800 font-semibold text-lg">
              Detailed Sentence Breakdown
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {sentence_analysis.map((sentence, index) => {
              const strength = getSentenceStrength(sentence.score);
              const color = sentence.score > 0.8 ? 'green' :
                           sentence.score > 0.7 ? 'blue' :
                           sentence.score > 0.6 ? 'amber' : 'red';
              
              // Find errors that might be in this sentence
              const sentenceText = sentence.sentence;
              const relatedErrors = error_details.filter(error => 
                error.context === sentenceText
              );

              return (
                <div key={index} className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-gray-700">
                      Sentence {index + 1}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
                      {strength} ({Math.round(sentence.score * 100)}%)
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full bg-${color}-500`}
                      style={{ width: `${sentence.score * 100}%` }}
                    />
                  </div>

                  <p className="text-gray-600 border-l-2 border-gray-300 pl-3 mb-2">
                    "{sentence.sentence}"
                  </p>

                  {/* Show specific errors for this sentence if available */}
                  {relatedErrors.length > 0 && (
                    <div className="mt-2 pl-3">
                      <p className="text-sm font-medium text-red-600">Issues found in this sentence:</p>
                      <ul className="list-disc pl-5 mt-1 text-sm text-red-600">
                        {relatedErrors.map((error, i) => (
                          <li key={i}>
                            {error.category}: {error.message}
                            {error.suggestion && ` (Suggestion: "${error.suggestion}")`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {sentence.score < 0.7 ? (
                    <div className="text-red-600 text-sm mt-2">
                      ⚠️ This sentence scored lower than average. Consider:
                      <ul className="list-disc pl-5 mt-1">
                        {dominantErrorCategory === 'TYPOS' ? (
                          <>
                            <li>Checking spelling of each word</li>
                            <li>Using more common vocabulary</li>
                            <li>Proofreading for typographical errors</li>
                          </>
                        ) : (
                          <>
                            <li>Checking subject-verb agreement</li>
                            <li>Reviewing tense consistency</li>
                            <li>Simplifying complex structures</li>
                          </>
                        )}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-green-600 text-sm mt-2">
                      ✅ This sentence demonstrates good grammatical structure
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dynamic Next Steps */}
      <div className="p-5 bg-indigo-50 rounded-lg border border-indigo-100 shadow-sm">
        <h3 className="text-indigo-800 font-semibold text-lg mb-3">
          📈 Recommended Next Steps
        </h3>
        <div className="space-y-2">
          {dominantErrorCategory && (
            <div className="text-indigo-700">
              • Focus first on reducing {dominantErrorCategory.toLowerCase()} errors, which make up your most common mistake type
            </div>
          )}
          
          {overall_score < 5 && (
            <>
              <div className="text-indigo-700">
                • Spend 15-20 minutes daily on basic grammar exercises focusing on sentence structure
              </div>
              <div className="text-indigo-700">
                • Use a spell checker consistently before submitting your work
              </div>
            </>
          )}
          
          {overall_score >= 5 && overall_score < 7 && (
            <>
              <div className="text-indigo-700">
                • Practice with 2-3 complex grammatical structures per week
              </div>
              <div className="text-indigo-700">
                • Review the rules for your most common error types
              </div>
            </>
          )}
          
          {overall_score >= 7 && (
            <div className="text-indigo-700">
              • Work on refinement rather than correction - practice advanced punctuation and complex sentence structures
            </div>
          )}
          
          <div className="text-indigo-700">
            • Complete targeted exercises focusing on your specific error patterns
          </div>
        </div>
      </div>
    </div>
  );
};

GrammarDetailsContent.propTypes = {
  grammarAnalysis: PropTypes.object,
  ieltsScore: PropTypes.number
};

export default GrammarDetailsContent;