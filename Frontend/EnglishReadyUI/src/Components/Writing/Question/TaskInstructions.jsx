import React, { useState } from 'react';
import PropTypes from 'prop-types';

const taskImage = new URL('../../../assets/image.jpg', import.meta.url).href;

const TaskInstructions = ({ selectedSection, guidelines, hints }) => {
  const [isImageMaximized, setIsImageMaximized] = useState(false);

  const toggleImageSize = () => {
    setIsImageMaximized(!isImageMaximized);
  };

  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <h3 className="font-medium text-gray-800 mb-4">Task Instructions</h3>
      
      {isImageMaximized && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button 
              onClick={toggleImageSize}
              className="absolute top-2 right-2 bg-white rounded-full p-2 text-gray-800 hover:bg-gray-200 transition-colors"
              aria-label="Close fullscreen image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={taskImage}
              alt="Task Graph - Full Size" 
              className="w-full h-auto rounded"
            />
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <p className="text-gray-600 mb-4">
            The graph above shows population growth in different regions. Write a report 
            describing the key features and make comparisons where relevant. 
            You should write at least 150 words.
          </p>
          
          <div className="text-sm text-gray-500 space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Time Allowed: 20 minutes
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Minimum Words: 150
            </div>
          </div>
          
          {/* Guidelines for current section - embedded within task card */}
          {selectedSection && guidelines && (
            <div className="border-t border-gray-100 pt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)} Guidelines:
              </h4>
              <ul className="space-y-1.5">
                {guidelines[selectedSection].map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              
              {/* Section Hint */}
              {hints && hints[selectedSection] && (
                <div className="mt-2 text-sm text-gray-700">
                  <strong>Tip:</strong> {hints[selectedSection]}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="w-full md:w-96 bg-gray-100 rounded-lg flex items-center justify-center relative">
          <div className="relative w-full">
            <img 
              src={taskImage}
              alt="Task Graph" 
              className="max-w-full h-auto rounded"
            />
            <button
              onClick={toggleImageSize}
              className="absolute top-1 right-2 bg-white bg-opacity-90 rounded p-1.5 text-gray-700 hover:bg-opacity-100 hover:text-blue-600 transition-all shadow-sm"
              aria-label="Enlarge image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

TaskInstructions.propTypes = {
  selectedSection: PropTypes.string,
  guidelines: PropTypes.object,
  hints: PropTypes.object
};

export default TaskInstructions;