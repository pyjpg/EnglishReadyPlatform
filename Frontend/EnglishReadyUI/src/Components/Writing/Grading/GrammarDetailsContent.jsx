import React from 'react';
import PropTypes from 'prop-types';

const ScoreCard = ({ title, score, max = 9.0, color, emoji }) => {
  const percentage = (score / max) * 100;
  return (
    <div className={`p-4 bg-${color}-50 rounded-xl border-2 border-${color}-100 shadow-sm transition-transform hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{emoji}</span>
          <h3 className={`text-${color}-800 font-bold`}>{title}</h3>
        </div>
        <span className={`text-${color}-800 font-bold text-xl`}>
          {score.toFixed(1)}<span className="text-sm opacity-75">/{max}</span>
        </span>
      </div>
      <div className="relative pt-2">
        <div className={`overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-${color}-200`}>
          <div
            style={{ width: `${percentage}%` }}
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-${color}-500 transition-all duration-500`}
          />
        </div>
      </div>
    </div>
  );
};

const ProgressPill = ({ score, label, max = 9 }) => {
  const color = getScoreColor(score);
  return (
    <div className="flex items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-8 h-8 rounded-full bg-${color}-100 flex items-center justify-center mr-3`}>
        <span className={`text-sm font-bold text-${color}-800`}>{(score).toFixed(1)}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full bg-${color}-500 transition-all duration-500`}
            style={{ width: `${(score/max)*100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({ emoji, title }) => (
  <div className="flex items-center mb-4">
    <span className="text-2xl mr-2">{emoji}</span>
    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
  </div>
);

const AnalysisGrid = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
);

// Shared Logic -----------------------------------------------------------------
const getScoreColor = (score) => {
  if (score >= 8) return 'green';
  if (score >= 7) return 'blue';
  if (score >= 6) return 'amber';
  return 'red';
};


// Shared across both components


const GrammarDetailsContent = ({ grammarAnalysis, ieltsScore }) => {
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

  // Dynamic general tips based on common issues
  const generalGrammarTips = [
    "Always proofread for subject-verb agreement",
    "Use commas to separate independent clauses joined by conjunctions",
    "Maintain consistent verb tenses throughout your writing",
    "Ensure proper article usage with singular countable nouns"
  ];

  const { overall_score, feedback, sentence_analysis = [] } = grammarAnalysis;
  const ieltsColor = getScoreColor(ieltsScore);
  const grammarColor = getScoreColor(overall_score);

  return (
    <div className="space-y-6">
      {/* Score Cards Section - Remains same */}

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
                <p key={i} className="text-blue-800">
                  {point.replace(/\.$/, '')}.
                </p>
              ))
            ) : (
              <p className="text-blue-800 italic">{feedback}</p>
            )
          )}
          {sentence_analysis.some(s => s.score < 0.7) && (
            <div className="mt-3">
              <p className="text-blue-800 font-medium">
                Key Sentence Issues Found:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                {sentence_analysis.filter(s => s.score < 0.7).map((sentence, i) => (
                  <li key={i} className="text-blue-800">
                    Sentence {i+1}: {sentence.sentence.slice(0,50)}... - Score: {(sentence.score*100).toFixed(1)}%
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Improvement Tips */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-gray-800 font-semibold text-lg">
            Targeted Improvement Strategies
          </h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">
              🎯 Score-Specific Recommendations
            </h4>
            <ul className="list-disc pl-5 space-y-2 text-sm text-blue-700">
              {getImprovementTips(overall_score).map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">
              📘 General Grammar Best Practices
            </h4>
            <ul className="list-disc pl-5 space-y-2 text-sm text-blue-700">
              {generalGrammarTips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

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
              const color = strength.includes('Excellent') ? 'green' :
                           strength.includes('Very Good') ? 'blue' :
                           strength.includes('Good') ? 'amber' : 'red';

              return (
                <div key={index} className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-gray-700">
                      Sentence {index + 1}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
                      {strength}
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

                  {sentence.score < 0.7 ? (
                    <div className="text-red-600 text-sm">
                      ⚠️ This sentence scored lower than average. Consider:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Checking subject-verb agreement</li>
                        <li>Reviewing tense consistency</li>
                        <li>Simplifying complex structures</li>
                      </ul>
                    </div>
                  ) : (
                    <div className="text-green-600 text-sm">
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
          {overall_score < 7 && (
            <div className="text-indigo-700">
              • Focus on mastering 2-3 complex grammatical structures per week
            </div>
          )}
          {overall_score >= 7 && (
            <div className="text-indigo-700">
              • Practice advanced punctuation in academic contexts
            </div>
          )}
          {sentence_analysis.some(s => s.score < 0.7) && (
            <div className="text-indigo-700">
              • Review and rewrite low-scoring sentences from this analysis
            </div>
          )}
          <div className="text-indigo-700">
            • Complete daily grammar exercises targeting your weak areas
          </div>
        </div>
      </div>
    </div>
  );
};

// PropTypes remain the same

export default GrammarDetailsContent;