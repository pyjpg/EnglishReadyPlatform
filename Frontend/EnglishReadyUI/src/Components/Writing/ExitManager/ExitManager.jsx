import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from "react-router-dom";
import CircularProgress from '../Sidebar/ScoreCard/CircularProgress';

const WritingModeExitManager = ({ 
  sectionsData, 
  onExit, 
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

  const navigate = useNavigate();
  
  useEffect(() => {
    if (sectionsData && Object.keys(sectionsData).length > 0) {
      calculateScores();
      generateFinalFeedback();
    }
  }, [sectionsData]);

  const calculateScores = () => {
    const sections = Object.keys(sectionsData).filter(key => 
      ['introduction', 'analysis', 'conclusion'].includes(key)
    );
    
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
      if (sectionsData[section] && typeof sectionsData[section].grade === 'number') {
        const sectionScore = Math.min(100, Math.max(0, sectionsData[section].grade));
        
        const sectionPercentage = sectionScore;
        
        newSectionScores[section] = {
          score: sectionScore,
          percentage: sectionPercentage
        };
        
        totalScore += sectionScore * (weights[section] || 0.33);
        totalWeight += (weights[section] || 0.33);
      }
    });

    const calculatedFinalScore = totalWeight > 0 ? (totalScore / totalWeight) : 0;
    const normalizedScore = Math.min(100, Math.max(0, calculatedFinalScore));
    
    setFinalScore(parseFloat(normalizedScore.toFixed(1)));
    setPercentageScore(normalizedScore); 
    setSectionScores(newSectionScores);
  };

  const generateFinalFeedback = () => {
    const sections = Object.keys(sectionsData).filter(key => 
      ['introduction', 'analysis', 'conclusion'].includes(key)
    );
    
    if (sections.length === 0) return;

    const allImprovements = [];
    
    sections.forEach(section => {
      const data = sectionsData[section];
      
      if (data?.task_achievement_analysis?.feedback?.improvements?.length) {
        allImprovements.push(...data.task_achievement_analysis.feedback.improvements.slice(0, 1));
      }
      
      if (data?.grammar_analysis?.feedback && typeof data.grammar_analysis.feedback === 'string') {
        allImprovements.push(data.grammar_analysis.feedback);
      }
      
      if (data?.coherence_analysis?.feedback?.improvements?.length) {
        allImprovements.push(...data.coherence_analysis.feedback.improvements.slice(0, 1));
      }
    });
    
    let feedback = '';
    
    if (finalScore >= 85) {
      feedback = `Excellent work, your essay demonstrates a strong command of English writing skills. `;
    } else if (finalScore >= 70) {
      feedback = `Good job, your essay shows competent english writing skills with some areas for improvement. `;
    } else if (finalScore >= 55) {
      feedback = `You've shown basic competency in your writing. With some focused practice, you can improve significantly. `;
    } else {
      feedback = `You've, you've made a good start. Let's work on developing your writing skills further. `;
    }
    
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
  
    
    setTimeout(() => {
      window.location.reload();
    }, 500); 
  };
  const getScoreColorClass = (score) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 55) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <>
      <button
          onClick={() => setShowModal(true)}
          className="w-full px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
        >
          Complete & Return to Chat
        </button>
    
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Exit Writing Mode</h2>
            
            <div className="mb-6 flex items-center justify-center flex-col">
              <div className="flex flex-col items-center mb-2">
                <CircularProgress percentage={percentageScore} />
                <span className={`text-2xl font-bold mt-2 ${getScoreColorClass(finalScore)}`}>
                  {finalScore.toFixed(1)}/100.0
                </span>
                <span className="text-sm text-gray-500">Final Score</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Feedback Summary</h3>
              <p className="text-gray-600 bg-blue-50 p-3 rounded-lg">{finalFeedback}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Section Breakdown</h3>
              <div className="space-y-4">
                {Object.keys(sectionScores).map(section => {
                  if (!sectionsData[section] || typeof sectionsData[section].grade !== 'number') {
                    return null;
                  }
                  
                  return (
                    <div key={section} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="capitalize text-gray-700 font-medium">{section}</span>
                        <span className={`font-medium ${getScoreColorClass(sectionScores[section].score)}`}>
                          {sectionScores[section].score.toFixed(1)}/100.0
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`rounded-full h-2 ${
                            sectionScores[section].score >= 85 ? "bg-green-500" : 
                            sectionScores[section].score >= 70 ? "bg-blue-500" : 
                            sectionScores[section].score >= 55 ? "bg-amber-500" : 
                            "bg-red-500"
                          }`}
                          style={{ width: `${sectionScores[section].percentage}%` }}
                        />
                      </div>
                      {sectionsData[section]?.task_achievement_analysis?.feedback?.improvements?.length > 0 && (
                        <p className="text-xs text-gray-600 mt-1 italic">
                          "{sectionsData[section].task_achievement_analysis.feedback.improvements[0]}"
                        </p>
                      )}
                    </div>
                  );
                })}
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
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
};

export default WritingModeExitManager;