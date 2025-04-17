import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import WritingSidebar from '../Sidebar/WritingSidebar';
import TaskInstructions from '../Question/TaskInstructions';
import WritingArea from '../WritingArea/WritingArea';
import FeedbackModalsManager from '../Grading/FeedbackModalManager';

const WritingMode = ({ 
  textAreaRef, 


 
  setIsWritingMode,
 
}) => {
  // Available sections
  const sections = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'conclusion', label: 'Conclusion' }
  ];
  const [sectionsData, setSectionsData] = useState({
    introduction: null,
    analysis: null,
    conclusion: null
  });
  const [selectedSection, setSelectedSection] = useState(sections[0].id);
  const [focusMode, setFocusMode] = useState(false);
  // Store content for each section
  const [sectionContent, setSectionContent] = useState({
    introduction: '',
    analysis: '',
    conclusion: ''
  });
 
  const [sectionAttempts, setSectionAttempts] = useState({
    introduction: 3,
    analysis: 3,
    conclusion: 3
  });
  
  // Auto-save timer
  const [lastSaved, setLastSaved] = useState(null);
  
  // Guidelines for each section
  const sectionGuidelines = {
    introduction: [
      'Paraphrase the main question',
      'Provide an overview of the graph',
      'Use appropriate academic language'
    ],
    analysis: [
      'Describe trends and patterns',
      'Include specific data from the graph',
      'Compare different regions where relevant',
      'Use a range of language to describe changes'
    ],
    conclusion: [
      'Summarize main points',
      'Avoid introducing new information',
      'End with a concise final statement'
    ]
  };
  
  // Placeholder text for each section
  const sectionPlaceholders = {
    introduction: "Start writing your introduction here...",
    analysis: "Describe the key features of the data, making relevant comparisons...",
    conclusion: "Summarize the main patterns and significant features observed..."
  };

  // Section-specific feedback hints
  const sectionHints = {
    introduction: "A strong introduction should paraphrase the question and provide a general overview without specific data.",
    analysis: "In your analysis, mention specific numbers from the table and compare different nationalities.",
    conclusion: "Your conclusion should summarize the main trends without introducing new information."
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
const [writingTaskData, setWritingTaskData] = useState(null);

const handleWritingSubmission = async (payload) => {
  if (sectionAttempts[selectedSection] <= 0) {
    return; // No attempts left
  }
  
  setIsSubmitting(true);
  
  try {
    // Decrease attempts for current section
    setSectionAttempts(prev => ({
      ...prev, 
      [selectedSection]: prev[selectedSection] - 1
    }));
    
    const response = await fetch('http://127.0.0.1:8000/api/submit-writing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: payload.text,
        task_type: payload.task_type,
        question_number: payload.question_number,
        section: payload.section
      }),
    });

    if (!response.ok) throw new Error('Submission failed');
    
    const data = await response.json();
    
    // Store section-specific data
    setSectionsData(prev => ({
      ...prev,
      [payload.section]: data
    }));
    
    // Also update current writing task data for sidebar display
    setWritingTaskData(data);
    
  } catch (error) {
    console.error('Submission error:', error);
  } finally {
    setIsSubmitting(false);
  }
};

  // Handle section change via dropdown
  const handleSectionChange = (e) => {
    // Save current content before changing
    saveCurrentContent();
    // Change section
    setSelectedSection(e.target.value);
  };

  // Navigate to previous section
  const goToPrevSection = () => {
    const currentIndex = sections.findIndex(section => section.id === selectedSection);
    if (currentIndex > 0) {
      saveCurrentContent();
      setSelectedSection(sections[currentIndex - 1].id);
    }
  };

  // Navigate to next section
  const goToNextSection = () => {
    const currentIndex = sections.findIndex(section => section.id === selectedSection);
    if (currentIndex < sections.length - 1) {
      saveCurrentContent();
      setSelectedSection(sections[currentIndex + 1].id);
    }
  };
  
  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
  };

  // Save current section content
  const saveCurrentContent = () => {
    if (textAreaRef.current) {
      setSectionContent(prev => ({
        ...prev,
        [selectedSection]: textAreaRef.current.value
      }));
      setLastSaved(new Date());
    }
  };

  // Auto-save every 5 seconds if content changed
  useEffect(() => {
    const timer = setInterval(() => {
      if (textAreaRef.current && textAreaRef.current.value !== sectionContent[selectedSection]) {
        saveCurrentContent();
      }
    }, 5000);
    
    return () => clearInterval(timer);
  }, [selectedSection, sectionContent]);

  
  // Update textarea content when section changes
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.value = sectionContent[selectedSection] || '';
      // Trigger any listeners on the textarea
      const event = new Event('input', { bubbles: true });
      textAreaRef.current.dispatchEvent(event);
    }
  }, [selectedSection]);
  useEffect(() => {
    // Load attempts from localStorage on initial load
    const savedAttempts = localStorage.getItem('sectionAttempts');
    if (savedAttempts) {
      setSectionAttempts(JSON.parse(savedAttempts));
    }
  }, []);
  
  // Save attempts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sectionAttempts', JSON.stringify(sectionAttempts));
  }, [sectionAttempts]);

  const currentTextValue = textAreaRef.current ? textAreaRef.current.value : '';
  const currentWordCount = currentTextValue.trim().split(/\s+/).filter(word => word !== '').length;
  const storedWordCount = Object.values(sectionContent)
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(word => word !== '').length;
    const totalWordCount = currentWordCount + storedWordCount - (sectionContent[selectedSection] ? 
    sectionContent[selectedSection].trim().split(/\s+/).filter(word => word !== '').length : 0);

  return (
    <div className="fixed inset-0 bg-white flex">
      {/* Main Content */}
      <div className={`flex-1 p-6 flex flex-col ${focusMode ? 'max-h-screen overflow-hidden' : ''}`}>
        {!focusMode && (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">IELTS Writing - Task 1 - Question 3/6</h2>
            <div>
              <button 
                onClick={toggleFocusMode}
                className="flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.55 4.55M14.5 4h5v5M9.5 4h-5v5M4 15l4.55-4.55M14.5 20h5v-5M9.5 20h-5v-5" />
                </svg>
                Enter Focus Mode
              </button>
            </div>
          </>
        )}
        
        {/* Task Instructions - modified to adjust in focus mode */}
        <div className={`${focusMode ? 'pt-4 pb-2' : ''}`}>
          <TaskInstructions 
            selectedSection={selectedSection}
            guidelines={sectionGuidelines}
            hints={sectionHints}
          />
        </div>
        
        {!focusMode && (
          <>
            {/* Section Navigation - Fixed width dropdown */}
            <div className="mb-4 flex items-center">
              <label htmlFor="section-select" className="text-sm font-medium text-gray-700 mr-2">
                Select section to write:
              </label>
              <div className="flex items-center space-x-2">
                <select
                  id="section-select"
                  value={selectedSection}
                  onChange={handleSectionChange}
                  className="w-48 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {sections.map(section => (
                    <option key={section.id} value={section.id}>
                      {section.label}
                    </option>
                  ))}
                </select>
                
                <div className="flex space-x-2">
                  <button
                    onClick={goToPrevSection}
                    disabled={sections.findIndex(s => s.id === selectedSection) === 0}
                    className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md disabled:opacity-50"
                    title="Previous section"
                  >
                    ←
                  </button>
                  <button
                    onClick={goToNextSection}
                    disabled={sections.findIndex(s => s.id === selectedSection) === sections.length - 1}
                    className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md disabled:opacity-50"
                    title="Next section"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>

            {/* Auto-save indicator */}
            {lastSaved && (
              <div className="text-xs text-gray-500 mb-1">
                Auto-saved {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </>
        )}

        {/* Writing Area - Made more prominent */}
        <div className={`flex-grow ${focusMode ? 'h-full mb-12' : 'min-h-400px '} flex flex-col `}>
          <WritingArea 
            textAreaRef={textAreaRef}
            placeholder={sectionPlaceholders[selectedSection]}
            section={selectedSection}
            initialContent={sectionContent[selectedSection]}
            onSubmit={handleWritingSubmission}
          />
        </div>
        
        {focusMode ? (
       <div className="fixed bottom-4 right-4 flex space-x-3 z-10 ">
       <button
         onClick={toggleFocusMode}
         className="flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200"
       >
         <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
         </svg>
         Exit Focus Mode
       </button>
       <div className="text-sm text-gray-600 self-center">
         {totalWordCount}/150 words
          </div>
          <div className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full shadow-sm border border-blue-100">
      {Array.from({ length: 3 }).map((_, i) => (
        <div 
          key={i}
          className={`w-3 h-3 rounded-full transition-all ${
            i < sectionAttempts[selectedSection]
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm scale-100'
              : 'bg-gray-200 scale-90 opacity-40'
          }`}
        />
      ))}
      <span className={`ml-1 text-sm font-medium ${
        sectionAttempts[selectedSection] === 0 
          ? 'text-red-500' 
          : sectionAttempts[selectedSection] === 1
            ? 'text-orange-500'
            : 'text-blue-600'
      }`}>
        {sectionAttempts[selectedSection]} attempt{sectionAttempts[selectedSection] !== 1 ? 's' : ''} left
      </span>
    </div>
       <button
        onClick={handleWritingSubmission}
        disabled={isSubmitting || sectionAttempts[selectedSection] <= 0}
        className={`px-6 py-2 ${
          sectionAttempts[selectedSection] <= 0 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700'
        } text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
      >
        {sectionAttempts[selectedSection] <= 0 ? 'No attempts left' : 'Submit'}
      </button>
     </div>
        ) : (
          <div className="mt-2 flex justify-between text-sm">
            <div className="text-gray-600">
              Total word count: {totalWordCount}/150 (minimum)
            </div>
            <div className="flex items-center space-x-1 px-3 py-1.5 bg-white rounded-full shadow-md border border-blue-200 animate-pulse-light">
  {Array.from({ length: 3 }).map((_, i) => (
    <div 
      key={i}
      className={`w-4 h-4 rounded-full transition-all ${
        i < sectionAttempts[selectedSection]
          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md scale-100'
          : 'bg-gray-200 scale-90 opacity-40'
      }`}
    />
  ))}
  <span className={`ml-1 text-sm font-medium ${
    sectionAttempts[selectedSection] === 0 
      ? 'text-red-500 font-bold' 
      : sectionAttempts[selectedSection] === 1
        ? 'text-orange-500 font-bold'
        : 'text-blue-600 font-bold'
  }`}>
    {sectionAttempts[selectedSection]} attempt{sectionAttempts[selectedSection] !== 1 ? 's' : ''} left
  </span>
</div>
            <div className="text-blue-600">
              {sections.map((section, index) => (
                <span key={section.id} className="mx-1">
                  <span 
                    className={`w-2 h-2 inline-block rounded-full mr-1 ${
                      sectionContent[section.id].length > 0 ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                  {section.label.charAt(0)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Only shown when NOT in focus mode */}
      {!focusMode && (
  <div>
    <WritingSidebar
  feedbackData={writingTaskData}
  isSubmitting={isSubmitting}
  onSubmit={handleWritingSubmission}
  onExit={() => setIsWritingMode(false)}
  essayText={Object.values(sectionContent).join('\n\n')}
  taskType="argument"
  questionNumber={3}
  selectedSection={selectedSection}
  sectionsData={sectionsData}
/>
    <FeedbackModalsManager
 
  feedbackData={writingTaskData} // Passing directly to modal manager
/>
  </div>
  
  
)}
     
    </div>
  );
};

WritingMode.propTypes = {
  textAreaRef: PropTypes.object.isRequired,
  grade: PropTypes.number.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  setIsWritingMode: PropTypes.func.isRequired,
  grammarAnalysis: PropTypes.object,
  lexicalAnalysis: PropTypes.object,
  taskAchievementAnalysis: PropTypes.object,
  coherenceAnalysis: PropTypes.object,
};

export default WritingMode;