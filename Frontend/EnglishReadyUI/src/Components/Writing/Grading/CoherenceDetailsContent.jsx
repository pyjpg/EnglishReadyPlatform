import React from 'react';
import PropTypes from 'prop-types';
import FeedbackIcons from '../Grading/FeedbackIcons';

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

  // Helper function to render strengths
  const renderStrengths = (strengths) => {
    return strengths.length > 0 ? (
      <ul className="list-disc list-inside text-gray-600">
        {strengths.map((strength, index) => (
          <li key={index}>{strength}</li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-600">No strengths identified.</p>
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
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="text-gray-600">{value.toFixed(1)}/9</span>
                </div>
                {renderProgressBar(value)}
              </li>
            ))}
        </ul>
      </div>

      {/* Strengths */}
      {coherenceAnalysis?.feedback?.strengths && coherenceAnalysis.feedback.strengths.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Strengths</h3>
          <div className="bg-green-50 p-4 rounded-lg">
            {renderStrengths(coherenceAnalysis.feedback.strengths)}
          </div>
        </div>
      )}

      {/* Key Improvements */}
      {coherenceAnalysis?.feedback?.improvements && coherenceAnalysis.feedback.improvements.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Key Improvements</h3>
          <div className="bg-yellow-50 p-4 rounded-lg">
            {renderDetailedSuggestions(coherenceAnalysis.feedback.improvements)}
          </div>
        </div>
      )}

      {/* Detailed Analysis */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Detailed Analysis</h3>
        <div className="space-y-4">
          {/* Paragraph Structure */}
          <div className="bg-white p-3 border rounded shadow-sm">
            <h4 className="font-medium text-gray-700">Paragraph Structure</h4>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Score:</span>
                <span className="font-medium">{coherenceAnalysis.component_scores?.paragraph_structure?.toFixed(1) || 'N/A'}/9</span>
              </div>
              <div>{renderProgressBar(coherenceAnalysis.component_scores?.paragraph_structure)}</div>
              <p className="text-gray-600">
                <span className="font-medium">Paragraph Count:</span> {coherenceAnalysis.detailed_analysis?.paragraph_structure?.paragraph_count || 'N/A'}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Average Paragraph Length:</span> {coherenceAnalysis.detailed_analysis?.paragraph_structure?.average_paragraph_length || 'N/A'} words
              </p>
              <div className="mt-2">
                <h5 className="font-medium text-gray-600">Paragraph Details:</h5>
                <ul className="list-disc list-inside text-gray-600">
                  {coherenceAnalysis.detailed_analysis?.paragraph_structure?.paragraph_details.map((detail, index) => (
                    <li key={index}>
                      Paragraph {index + 1}: {detail.sentence_count} sentences, Topic Sentence Quality: {detail.topic_sentence_quality}/5
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Linking Devices */}
          <div className="bg-white p-3 border rounded shadow-sm">
            <h4 className="font-medium text-gray-700">Linking Devices</h4>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Score:</span>
                <span className="font-medium">{coherenceAnalysis.component_scores?.linking_devices?.toFixed(1) || 'N/A'}/9</span>
              </div>
              <div>{renderProgressBar(coherenceAnalysis.component_scores?.linking_devices)}</div>
              <p className="text-gray-600">
                <span className="font-medium">Total Linking Devices:</span> {coherenceAnalysis.detailed_analysis?.linking_device_usage?.total_linking_devices || 'N/A'}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Linking Diversity Score:</span> {coherenceAnalysis.detailed_analysis?.linking_device_usage?.linking_diversity_score || 'N/A'}/5
              </p>
              <div className="mt-2">
                <h5 className="font-medium text-gray-600">Device Distribution:</h5>
                <ul className="list-disc list-inside text-gray-600">
                  {Object.entries(coherenceAnalysis.detailed_analysis?.linking_device_usage?.device_distribution || {}).map(([device, count]) => (
                    <li key={device}>
                      {device.replace(/_/g, ' ').charAt(0).toUpperCase() + device.replace(/_/g, ' ').slice(1)}: {count}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Referential Cohesion */}
          <div className="bg-white p-3 border rounded shadow-sm">
            <h4 className="font-medium text-gray-700">Referential Cohesion</h4>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Score:</span>
                <span className="font-medium">{coherenceAnalysis.component_scores?.referential_cohesion?.toFixed(1) || 'N/A'}/9</span>
              </div>
              <div>{renderProgressBar(coherenceAnalysis.component_scores?.referential_cohesion)}</div>
              <p className="text-gray-600">
                <span className="font-medium">Noun Reference Count:</span> {coherenceAnalysis.detailed_analysis?.referential_cohesion?.noun_reference_count || 'N/A'}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Pronoun Usage:</span> {coherenceAnalysis.detailed_analysis?.referential_cohesion?.pronoun_usage || 'N/A'}
              </p>
              <div className="mt-2">
                <h5 className="font-medium text-gray-600">Most Referenced Nouns:</h5>
                <ul className="list-disc list-inside text-gray-600">
                  {Object.entries(coherenceAnalysis.detailed_analysis?.referential_cohesion?.most_referenced_nouns || {}).map(([noun, count]) => (
                    <li key={noun}>
                      "{noun}": {count} time{count !== 1 ? 's' : ''}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Logical Flow */}
          <div className="bg-white p-3 border rounded shadow-sm">
            <h4 className="font-medium text-gray-700">Logical Flow</h4>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Score:</span>
                <span className="font-medium">{coherenceAnalysis.component_scores?.logical_flow?.toFixed(1) || 'N/A'}/9</span>
              </div>
              <div>{renderProgressBar(coherenceAnalysis.component_scores?.logical_flow)}</div>
              <p className="text-gray-600">
                <span className="font-medium">Average Sentence Length:</span> {coherenceAnalysis.detailed_analysis?.logical_flow?.average_sentence_length?.toFixed(1) || 'N/A'} words
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Sentence Length Variation:</span> {coherenceAnalysis.detailed_analysis?.logical_flow?.sentence_length_variation || 'N/A'} words
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Complex Sentences Ratio:</span> {(coherenceAnalysis.detailed_analysis?.logical_flow?.complex_sentences_ratio * 100).toFixed(1) || 'N/A'}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Suggestions */}
      {coherenceAnalysis?.feedback?.detailed_suggestions && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Detailed Suggestions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['paragraph_structure', 'linking_devices', 'referential_cohesion', 'logical_flow'].map((section) => (
              coherenceAnalysis.feedback.detailed_suggestions[section] && (
                <div key={section} className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 capitalize mb-2">{section.replace(/_/g, ' ')}</h4>
                  {renderDetailedSuggestions(coherenceAnalysis.feedback.detailed_suggestions[section] || [])}
                </div>
              )
            ))}
          </div>
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