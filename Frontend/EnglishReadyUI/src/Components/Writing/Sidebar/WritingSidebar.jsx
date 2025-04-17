import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import FeedbackModalsManager from '../Grading/FeedbackModalManager';
import WritingModeExitManager from '../ExitManager';
import OverallProgress from './OverallProgress';
import { useOverallGrade } from '../../../hooks/useOverallGrade';
import SectionScoreCard from './ScoreCard/SectionScoreCard';
import AnalysisCard from './AnalysisCards/AnalysisCard';
import GrammarAnalysis from './AnalysisCards/GrammarCard';
import SectionSummary from './ScoreCard/SectionSummary';
import KeyImprovements from './ScoreCard/KeyImprovements';
import CurrentGrade from './ScoreCard/CurrentGrade';
import SubmitButton from './SubmitButton';
const WritingSidebar = ({
  feedbackData,
  isSubmitting,
  onSubmit,
  onExit,
  essayText,
  taskType,
  questionNumber,
  questionDesc = "The graph above shows population growth in different regions. Write a report describing the key features and make comparisons where relevant. You should write at least 150 words.",
  questionRequirements = "A strong introduction should paraphrase the question and provide a general overview without specific data.",
  selectedSection,
  sectionsData = {}
}) => {
  const [activeModal, setActiveModal] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [sectionAttempts, setSectionAttempts] = useState({
    introduction: 3,
    analysis: 3,
    conclusion: 3
  });
  
  const [sectionScores, setSectionScores] = useState({
    introduction: { score: 0, percentage: 0 },
    analysis: { score: 0, percentage: 0 },
    conclusion: { score: 0, percentage: 0 }
  });
  
  useEffect(() => {
    const savedAttempts = localStorage.getItem('sectionAttempts');
    if (savedAttempts) {
      setSectionAttempts(JSON.parse(savedAttempts));
    }
  }, []);

  // Save attempts when they change
  useEffect(() => {
    localStorage.setItem('sectionAttempts', JSON.stringify(sectionAttempts));
  }, [sectionAttempts]);
  
  // Update section scores when sectionsData changes
  useEffect(() => {
    if (sectionsData && Object.keys(sectionsData).length > 0) {
      const newSectionScores = { ...sectionScores };
      
      Object.keys(sectionsData).forEach(section => {
        if (sectionsData[section]?.grade) {
          const sectionScore = sectionsData[section].grade;
          const sectionPercentage = Math.min(100, Math.round((sectionScore / 9) * 100));
          
          newSectionScores[section] = {
            score: sectionScore,
            percentage: sectionPercentage
          };
        }
      });
      
      setSectionScores(newSectionScores);
    }
  }, [sectionsData]);
  

  const isGraded = feedbackData && Object.keys(feedbackData).length > 0;

  const getDbGrade = () => {
    return feedbackData?.grade || 0; 
  };
  console.log(sectionsData);

  const overallGrade = useOverallGrade(sectionsData, feedbackData);
  console.log(overallGrade);

  const circularGrade = getDbGrade();
  console.log(circularGrade, overallGrade);
  const {
    grammar_analysis: grammarAnalysis = {},
    lexical_analysis: lexicalAnalysis = {},
    task_achievement_analysis: taskAnalysis = {},
    coherence_analysis: coherenceAnalysis = {}
  } = feedbackData || {};

 
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  const vocabularyMetricsRenderer = (
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="text-xs font-medium text-gray-500 mb-1">Unique Words</h4>
          <p className="text-lg font-semibold text-gray-800">
            {lexicalAnalysis?.detailed_analysis?.lexical_diversity?.unique_words || 0}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="text-xs font-medium text-gray-500 mb-1">Lexical Diversity</h4>
          <p className="text-lg font-semibold text-gray-800">
            {lexicalAnalysis?.detailed_analysis?.lexical_diversity?.diversity_ratio?.toFixed(2) || 0}%
          </p>
        </div>
      </div>
    );
    const taskMetricsRenderer = (
        <div className="mt-4">
          <h4 className="text-xs font-medium text-gray-500 mb-2">Task Requirements Met</h4>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              {taskAnalysis?.feedback?.strengths?.[0] || 'Strong topic relevance and task achievement'}
            </p>
          </div>
        </div>
      );

    const coherenceMetricsRenderer = (
      <div className="mt-4">
        <h4 className="text-xs font-medium text-gray-500 mb-2">Organization Quality</h4>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-700">
            {coherenceAnalysis?.feedback?.strengths?.[0] || 'Logical flow and organization of ideas'}
          </p>
        </div>
      </div>
    ); 

 
    const handleSubmit = () => {
      if (sectionAttempts[selectedSection] <= 0) {
        return;
      }
      
      const updatedAttempts = {
        ...sectionAttempts,
        [selectedSection]: sectionAttempts[selectedSection] - 1
      };
      
      // Update localStorage first (this is important for the test)
      localStorage.setItem('sectionAttempts', JSON.stringify(updatedAttempts));
      
      // Then update state
      setSectionAttempts(updatedAttempts);
    
      const payload = {
        text: essayText,
        task_type: taskType,
        question_number: questionNumber,
        question_desc: questionDesc,
        question_requirements: questionRequirements,
        section: selectedSection
      };
      
      onSubmit(payload);
    };
  const renderContent = () => {
    if (!isGraded) {
      return (
        <>
          <SectionSummary selectedSection={selectedSection} />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 italic text-center">Submit your {selectedSection} to receive detailed feedback and scoring.</p>
          </div>
        </>
      );
    }
    
    return (
      <>
        <KeyImprovements feedbackData={feedbackData} />
        
        <AnalysisCard
          title="Vocabulary & Word Choice"
          score={lexicalAnalysis?.overall_score || 0}
          criteriaType="vocabulary"
          colorClass="blue"
          onViewDetails={setActiveModal}
          metricsRenderer={vocabularyMetricsRenderer}
          feedback={lexicalAnalysis?.feedback}
        />
        <GrammarAnalysis 
          grammarAnalysis={grammarAnalysis}
          onToggleSection={toggleSection}
          isExpanded={!!expandedSections.grammar}
          onViewDetails={() => setActiveModal('grammar')}
        />
        <AnalysisCard
          title="Task Achievement"
          score={taskAnalysis?.band_score || 0}
          criteriaType="task"
          colorClass="purple"
          onViewDetails={setActiveModal}
          metricsRenderer={taskMetricsRenderer}
          feedback={taskAnalysis?.feedback?.strengths}
        />
        
        <AnalysisCard
          title="Coherence & Cohesion"
          score={coherenceAnalysis?.overall_score || 0}
          criteriaType="coherence"
          colorClass="amber"
          onViewDetails={setActiveModal}
          metricsRenderer={coherenceMetricsRenderer}
          feedback={coherenceAnalysis?.feedback?.improvements}
        />
      </>
    );
  };

  return (
    <div className="w-72 border-l bg-gray-50 p-4 flex flex-col h-full overflow-y-auto">
      {Object.keys(sectionsData).length > 0 ? (
  
        <>
        

          <SectionScoreCard
            selectedSection={selectedSection}
            sectionScores={sectionScores}
            sectionAttempts={sectionAttempts}
            sectionsData={sectionsData}
            feedbackData={feedbackData}
          />

          
       
            <OverallProgress sectionsData={sectionsData} /> 
        
        </>
      ) : (
        <CurrentGrade 
          grade={circularGrade}
          isGraded={isGraded}
          feedbackData={feedbackData}
          setActiveModal={setActiveModal}
        />
      )}

      {renderContent()}

      <div className="mt-auto space-y-2">
       <SubmitButton
        isSubmitting={isSubmitting}
        attemptsRemaining={sectionAttempts[selectedSection]}
        onSubmit={handleSubmit}
        selectedSection={selectedSection}
      />
        
        <WritingModeExitManager
          sectionsData={sectionsData}
          onExit={onExit} 
        />
      </div>
    
      <FeedbackModalsManager
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        feedbackData={feedbackData}
      />
    </div>
  );
};

WritingSidebar.propTypes = {
  feedbackData: PropTypes.shape({
    grade: PropTypes.number,
    ielts_score: PropTypes.number,
    grammar_analysis: PropTypes.shape({
      overall_score: PropTypes.number,
      feedback: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
      ]),
      sentence_analysis: PropTypes.array,
    }),
    lexical_analysis: PropTypes.shape({
      overall_score: PropTypes.number,
      detailed_analysis: PropTypes.shape({
        lexical_diversity: PropTypes.shape({
          unique_words: PropTypes.number,
          diversity_ratio: PropTypes.number
        })
      }),
      feedback: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          improvements: PropTypes.arrayOf(PropTypes.string),
        })
      ]),
    }),
    task_achievement_analysis: PropTypes.shape({
      band_score: PropTypes.number,
      feedback: PropTypes.shape({
        strengths: PropTypes.arrayOf(PropTypes.string),
        improvements: PropTypes.arrayOf(PropTypes.string),
      }),
    }),
    coherence_analysis: PropTypes.shape({
      overall_score: PropTypes.number,
      feedback: PropTypes.shape({
        improvements: PropTypes.arrayOf(PropTypes.string),
      }),
    }),
  }),
  isSubmitting: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onExit: PropTypes.func.isRequired,
  essayText: PropTypes.string.isRequired,
  taskType: PropTypes.string.isRequired,
  questionNumber: PropTypes.number.isRequired,
  questionDesc: PropTypes.string,
  questionRequirements: PropTypes.string,
  selectedSection: PropTypes.string.isRequired,
  sectionsData: PropTypes.object
};

export default WritingSidebar;