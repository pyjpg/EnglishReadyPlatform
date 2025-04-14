import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from "react-router-dom";
import CircularProgress from './Sidebar/CircularProgress';

const WritingModeExitManager = ({ 
  sectionsData, 
  onExit, 
  onContinue,
  userName = "Student" 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [percentageScore, setPercentageScore] = useState(0);
  const [finalFeedback, setFinalFeedback] = useState('');
  const [sectionScores, setSectionScores] = useState({
    introduction: { score: 0, percentage: 0 },
    analysis: { score: 0, percentage: 0 },
    conclusion: { score: 0, percentage: 0 }
  });

  useEffect(() => {
    if (sectionsData) {
      calculateScores();
      generateFinalFeedback();
    }
  }, [sectionsData]);

  const navigate = useNavigate();
  
  const calculateScores = () => {
    // Calculate weighted average from all sections
    const sections = Object.keys(sectionsData);
    if (sections.length === 0) return;

    const weights = {
      introduction: 0.2,
      analysis: 0.6,
      conclusion: 0.2
    };

    let totalScore = 0;
    let totalWeight = 0;
    const newSectionScores = { ...sectionScores };

    sections.forEach(section => {
      if (sectionsData[section]?.grade) {
        // Calculate IELTS band score (0-9) for each section
        const sectionIeltsScore = sectionsData[section].grade;
        // Calculate percentage (0-100%) for the circular progress
        const sectionPercentage = Math.round((sectionsData[section].grade / 9) * 100);
        
        newSectionScores[section] = {
          score: sectionIeltsScore,
          percentage: sectionPercentage
        };
        
        totalScore += sectionIeltsScore * (weights[section] || 0.33);
        totalWeight += (weights[section] || 0.33);
      }
    });

    const calculatedFinalScore = totalWeight > 0 ? (totalScore / totalWeight) : 0;
    setFinalScore(parseFloat(calculatedFinalScore.toFixed(1)));
    setPercentageScore(Math.round((calculatedFinalScore / 9) * 100));
    setSectionScores(newSectionScores);
  };

  const generateFinalFeedback = () => {
    // Aggregate feedback from all sections
    const sections = Object.keys(sectionsData);
    if (sections.length === 0) return;

    // Get top improvements from each section
    const allImprovements = [];
    
    sections.forEach(section => {
      const data = sectionsData[section];
      
      // Task achievement improvements
      if (data?.task_achievement_analysis?.feedback?.improvements?.length) {
        allImprovements.push(...data.task_achievement_analysis.feedback.improvements.slice(0, 1));
      }
      
      // Grammar improvements
      if (data?.grammar_analysis?.feedback && typeof data.grammar_analysis.feedback === 'string') {
        allImprovements.push(data.grammar_analysis.feedback);
      }
      
      // Coherence improvements 
      if (data?.coherence_analysis?.feedback?.improvements?.length) {
        allImprovements.push(...data.coherence_analysis.feedback.improvements.slice(0, 1));
      }
    });
    
    // Create personalized feedback
    let feedback = '';
    
    if (finalScore >= 8) {
      feedback = `Excellent work, ${userName}! Your essay demonstrates a strong command of English writing skills. `;
    } else if (finalScore >= 6.5) {
      feedback = `Good job, ${userName}. Your essay shows competent English writing skills with some areas for improvement. `;
    } else if (finalScore >= 5) {
      feedback = `${userName}, you've shown basic competency in your writing. With some focused practice, you can improve significantly. `;
    } else {
      feedback = `${userName}, you've made a good start. Let's work on developing your writing skills further. `;
    }
    
    // Add specific improvements
    if (allImprovements.length > 0) {
      feedback += "Key areas to focus on: " + 
        allImprovements.slice(0, 3).map(imp => imp.trim()).join('; ') + '.';
    }

    setFinalFeedback(feedback);
  };

  const handleExit = () => {
    setShowModal(false);
    onExit(finalScore, finalFeedback);
    navigate("/");
    window.location.reload();
  };

  // Function to get color class based on score
  const getScoreColorClass = (score) => {
    if (score >= 7.5) return "text-green-600";
    if (score >= 6) return "text-blue-600";
    if (score >= 5) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <>
      {/* Exit Button */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Complete & Return to Chat
      </button>
    
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Exit Writing Mode</h2>
            
            {/* Final Score with Circular Progress */}
            <div className="mb-6 flex items-center justify-center flex-col">
              <div className="flex flex-col items-center mb-2">
                <CircularProgress percentage={percentageScore} />
                <span className={`text-2xl font-bold mt-2 ${getScoreColorClass(finalScore)}`}>
                  {finalScore}/9.0
                </span>
                <span className="text-sm text-gray-500">Final IELTS Score</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Feedback Summary</h3>
              <p className="text-gray-600 bg-blue-50 p-3 rounded-lg">{finalFeedback}</p>
            </div>
            
            {/* Section Breakdown with Visual Indicators */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Section Breakdown</h3>
              <div className="space-y-4">
                {Object.keys(sectionScores).map(section => (
                  <div key={section} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="capitalize text-gray-700 font-medium">{section}</span>
                      <span className={`font-medium ${getScoreColorClass(sectionScores[section].score)}`}>
                        {sectionScores[section].score.toFixed(1)}/9.0
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`rounded-full h-2 ${
                          sectionScores[section].score >= 7.5 ? "bg-green-500" : 
                          sectionScores[section].score >= 6 ? "bg-blue-500" : 
                          sectionScores[section].score >= 5 ? "bg-amber-500" : 
                          "bg-red-500"
                        }`}
                        style={{ width: `${sectionScores[section].percentage}%` }}
                      />
                    </div>
                    {sectionsData[section]?.task_achievement_analysis?.feedback?.improvements?.length > 0 && (
                      <p className="text-xs text-gray-600 mt-1 italic">
                        "{sectionsData[section]?.task_achievement_analysis?.feedback?.improvements[0]}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleExit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Return to Chat
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Continue Writing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

WritingModeExitManager.propTypes = {
  sectionsData: PropTypes.object.isRequired,
  onExit: PropTypes.func.isRequired,
  onContinue: PropTypes.func,
  userName: PropTypes.string
};

export default WritingModeExitManager;