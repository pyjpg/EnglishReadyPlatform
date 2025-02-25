import React from 'react';
import PropTypes from 'prop-types';
import FeedbackIcons from './FeedbackIcons';

const CoherenceDetailsContent = ({ coherenceAnalysis }) => {
  if (!coherenceAnalysis) {
    return <p className="text-gray-600">No coherence analysis data available.</p>;
  }

  // Helper function to render detailed suggestions
  const renderDetailedSuggestions = (suggestions) => {
    return suggestions.length > 0 ? (
      <ul className="list-disc list-inside text-gray-600">
        {suggestions.map((suggestion, index) => (
          <li key={index}>{suggestion}</li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-600">No detailed suggestions available.</p>
    );
  };

  // Helper function to render a progress bar
  const renderProgressBar = (score, maxScore = 9) => {
    const percentage = (score / maxScore) * 100;
    let color = 'bg-gray-300';

    if (percentage > 70) color = 'bg-green-500';
    else if (percentage > 30) color = 'bg-yellow-500';
    else color = 'bg-red-500';

    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    );
  };

  return (
    <div className="space-y-4 p-2">
      <div className="flex items-center mb-4">
        {FeedbackIcons.coherence}
        <h2 className="text-lg font-semibold ml-2">Coherence & Cohesion Analysis</h2>
      </div>

      {/* Overall Score */}
      <div className="bg-gray-100 p-3 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">Overall Score</span>
          <span className="text-xl font-bold text-blue-600">
            {coherenceAnalysis?.overall_score?.toFixed(1) || 'N/A'}/9
          </span>
        </div>
        {renderProgressBar(coherenceAnalysis?.overall_score)}
      </div>

      {/* Component Scores */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Component Scores</h3>
        <ul className="space-y-2">
          {coherenceAnalysis?.component_scores &&
            Object.entries(coherenceAnalysis.component_scores).map(([key, value]) => (
              <li key={key} className="bg-gray-50 p-2 rounded">
                <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                <span className="ml-2 text-gray-600">{value.toFixed(1)}</span>
                {renderProgressBar(value)}
              </li>
            ))}
        </ul>
      </div>

      {/* Detailed Analysis */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Detailed Analysis</h3>
        <div className="space-y-4">
          {/* Paragraph Structure */}
          <div>
            <h4 className="font-medium text-gray-700">Paragraph Structure</h4>
            <p className="text-gray-600">
              Paragraph Count: {coherenceAnalysis.detailed_analysis?.paragraph_structure?.paragraph_count || 'N/A'}
            </p>
            <ul className="list-disc list-inside text-gray-600">
              {coherenceAnalysis.detailed_analysis?.paragraph_structure?.paragraph_details.map((detail, index) => (
                <li key={index}>
                  Sentence Count: {detail.sentence_count}, Topic Sentence Quality: {detail.topic_sentence_quality}
                </li>
              ))}
            </ul>
            <p className="text-gray-600">
              Average Paragraph Length: {coherenceAnalysis.detailed_analysis?.paragraph_structure?.average_paragraph_length || 'N/A'}
            </p>
          </div>

          {/* Linking Devices */}
          <div>
            <h4 className="font-medium text-gray-700">Linking Devices</h4>
            <p className="text-gray-600">
              Total Linking Devices: {coherenceAnalysis.detailed_analysis?.linking_device_usage?.total_linking_devices || 'N/A'}
            </p>
            <ul className="list-disc list-inside text-gray-600">
              {Object.entries(coherenceAnalysis.detailed_analysis?.linking_device_usage?.device_distribution || {}).map(([device, count]) => (
                <li key={device}>
                  {device}: {count}
                </li>
              ))}
            </ul>
            <p className="text-gray-600">
              Linking Diversity Score: {coherenceAnalysis.detailed_analysis?.linking_device_usage?.linking_diversity_score || 'N/A'}
            </p>
          </div>

          {/* Referential Cohesion */}
          <div>
            <h4 className="font-medium text-gray-700">Referential Cohesion</h4>
            <p className="text-gray-600">
              Noun Reference Count: {coherenceAnalysis.detailed_analysis?.referential_cohesion?.noun_reference_count || 'N/A'}
            </p>
            <ul className="list-disc list-inside text-gray-600">
              {Object.entries(coherenceAnalysis.detailed_analysis?.referential_cohesion?.most_referenced_nouns || {}).map(([noun, count]) => (
                <li key={noun}>
                  {noun}: {count} times
                </li>
              ))}
            </ul>
            <p className="text-gray-600">
              Pronoun Usage: {coherenceAnalysis.detailed_analysis?.referential_cohesion?.pronoun_usage || 'N/A'}
            </p>
          </div>

          {/* Logical Flow */}
          <div>
            <h4 className="font-medium text-gray-700">Logical Flow</h4>
            <p className="text-gray-600">
              Average Sentence Length: {coherenceAnalysis.detailed_analysis?.logical_flow?.average_sentence_length || 'N/A'}
            </p>
            <p className="text-gray-600">
              Sentence Length Variation: {coherenceAnalysis.detailed_analysis?.logical_flow?.sentence_length_variation || 'N/A'}
            </p>
            <p className="text-gray-600">
              Complex Sentences Ratio: {coherenceAnalysis.detailed_analysis?.logical_flow?.complex_sentences_ratio || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Key Improvements */}
      {coherenceAnalysis?.feedback?.improvements && coherenceAnalysis.feedback.improvements.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Key Improvements</h3>
          <div className="bg-yellow-100 p-4 rounded-lg">
            {renderDetailedSuggestions(coherenceAnalysis.feedback.improvements)}
          </div>
        </div>
      )}

      {/* Detailed Suggestions */}
      {coherenceAnalysis?.feedback?.detailed_suggestions && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Detailed Suggestions</h3>
          {['paragraph_structure', 'linking_devices', 'referential_cohesion', 'logical_flow'].map((section) => (
            <div key={section} className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 capitalize">{section.replace(/_/g, ' ')}</h4>
              {renderDetailedSuggestions(coherenceAnalysis.feedback.detailed_suggestions[section] || [])}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

CoherenceDetailsContent.propTypes = {
  coherenceAnalysis: PropTypes.shape({
    overall_score: PropTypes.number,
    component_scores: PropTypes.object,
    detailed_analysis: PropTypes.object,
    feedback: PropTypes.object
  })
};

export default CoherenceDetailsContent;
