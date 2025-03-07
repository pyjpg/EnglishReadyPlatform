import React from 'react';
import PropTypes from 'prop-types';

const TaskAchievementDetailsContent = ({ taskAchievementAnalysis }) => {
  if (!taskAchievementAnalysis) return null;
  
  // For readability - destructure nested objects
  const wordCount = taskAchievementAnalysis.detailed_analysis?.word_count_analysis?.word_count || 0;
  const wordCountDifference = taskAchievementAnalysis.detailed_analysis?.word_count_analysis?.difference || 0;
  const meetsWordRequirement = taskAchievementAnalysis.detailed_analysis?.word_count_analysis?.meets_requirement || false;

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Overall Score</h3>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-blue-800 font-medium">Task Achievement Score</span>
            <span className="text-blue-800 font-bold">{taskAchievementAnalysis.band_score.toFixed(1)}/9.0</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${(taskAchievementAnalysis.band_score / 9) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Component Scores */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Component Scores</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {taskAchievementAnalysis.component_scores && Object.entries(taskAchievementAnalysis.component_scores).map(([key, value]) => (
            <div key={key} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">
                {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </div>
              <div className="flex justify-between items-center mb-1">
                <div className="h-2 w-full bg-gray-200 rounded-full">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(typeof value === 'number' ? value : parseFloat(value)) / 9 * 100}%` }}
                  />
                </div>
                <span className="ml-2 text-sm font-medium">
                  {typeof value === 'number' ? value.toFixed(1) : parseFloat(value).toFixed(1)}/9.0
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Word Count Analysis */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Word Count</h3>
        <div className={`p-4 rounded-lg border ${meetsWordRequirement ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <div className="flex justify-between items-center">
            <span className={meetsWordRequirement ? 'text-green-800' : 'text-red-800'}>Total Words</span>
            <span className="font-bold">{wordCount}</span>
          </div>
          {!meetsWordRequirement && (
            <div className="mt-2 text-red-700">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                You need <span className="font-medium">{Math.abs(wordCountDifference)}</span> more words to meet the minimum requirement.
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Paragraph Analysis */}
      {taskAchievementAnalysis.detailed_analysis?.structure_analysis?.paragraphs && 
       taskAchievementAnalysis.detailed_analysis.structure_analysis.paragraphs.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Paragraph Structure</h3>
          <div className="space-y-3">
            {taskAchievementAnalysis.detailed_analysis.structure_analysis.paragraphs.map((paragraph, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm text-gray-600">Paragraph {index + 1}</span>
                  <span className="text-xs text-gray-500">{paragraph.length} words</span>
                </div>
                <p className="text-sm text-gray-600 italic">{paragraph.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Topic Relevance */}
      {taskAchievementAnalysis.detailed_analysis?.content_analysis?.topic_relevance && (
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Topic Relevance</h3>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-blue-800 font-medium">Topic Adherence</span>
                <span className="text-blue-800">
                  {(taskAchievementAnalysis.detailed_analysis.content_analysis.topic_relevance.topic_adherence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${taskAchievementAnalysis.detailed_analysis.content_analysis.topic_relevance.topic_adherence * 100}%` }}
                />
              </div>
            </div>
            
            {taskAchievementAnalysis.detailed_analysis.content_analysis.topic_relevance.element_scores && (
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-2">Element Coverage</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(taskAchievementAnalysis.detailed_analysis.content_analysis.topic_relevance.element_scores).map(([element, score]) => (
                    <div key={element} className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-blue-700 capitalize">{element}</span>
                        <span className="text-blue-700">{(score * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full" 
                          style={{ width: `${score * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Feedback */}
      {taskAchievementAnalysis.feedback && (
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Feedback</h3>
          
          {/* Strengths */}
          {taskAchievementAnalysis.feedback.strengths && taskAchievementAnalysis.feedback.strengths.length > 0 && (
            <div className="mb-4">
              <h4 className="text-base font-medium text-green-700 mb-2">Strengths</h4>
              <ul className="list-disc pl-5 space-y-1">
                {taskAchievementAnalysis.feedback.strengths.map((strength, index) => (
                  <li key={index} className="text-green-700">{strength}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Improvements */}
          {taskAchievementAnalysis.feedback.improvements && taskAchievementAnalysis.feedback.improvements.length > 0 && (
            <div className="mb-4">
              <h4 className="text-base font-medium text-amber-700 mb-2">Areas for Improvement</h4>
              <ul className="list-disc pl-5 space-y-1">
                {taskAchievementAnalysis.feedback.improvements.map((improvement, index) => (
                  <li key={index} className="text-amber-700">{improvement}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Specific Suggestions */}
          {taskAchievementAnalysis.feedback.specific_suggestions && Object.keys(taskAchievementAnalysis.feedback.specific_suggestions).length > 0 && (
            <div>
              <h4 className="text-base font-medium text-blue-700 mb-2">Specific Suggestions</h4>
              {Object.entries(taskAchievementAnalysis.feedback.specific_suggestions).map(([category, suggestions]) => (
                suggestions.length > 0 && (
                  <div key={category} className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <h5 className="uppercase text-xs font-semibold text-blue-800 mb-2">
                      {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </h5>
                    <ul className="list-disc pl-5 space-y-1">
                      {suggestions.map((suggestion, index) => (
                        <li key={index} className="text-blue-700 text-sm">{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

TaskAchievementDetailsContent.propTypes = {
  taskAchievementAnalysis: PropTypes.shape({
    band_score: PropTypes.number.isRequired,
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
    })
  }).isRequired
};

export default TaskAchievementDetailsContent;