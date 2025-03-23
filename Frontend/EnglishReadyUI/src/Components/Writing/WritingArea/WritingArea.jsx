import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const WritingArea = ({ textAreaRef, onSubmit }) => {
  const [characterCount, setCharacterCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const minWords = 150;

  // Update character and word count
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    setCharacterCount(newText.length);
    setWordCount(newText.trim() === '' ? 0 : newText.trim().split(/\s+/).length);
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  const handleSubmit = () => {
    
    
    setIsSubmitting(true);
    if (onSubmit) {
      onSubmit(text)  
        .catch(error => {
          console.error('Error submitting writing:', error);
        })
        .finally(() => setIsSubmitting(false));
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className={`transition-all duration-300 ${focusMode ? 'opacity-100' : 'opacity-0'} absolute top-2 right-2 z-10 flex space-x-2`}>
              <button 
                onClick={() => setFocusMode(!focusMode)}
                className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
                title="Toggle focus mode"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            
            <textarea
              ref={textAreaRef}
              value={text}
              className={`absolute inset-0 w-full h-full p-4 text-lg border-t border-r border-b border-gray-200 border-l-4 border-l-blue-500 rounded-lg resize-none focus:ring-0 focus:outline-none transition-all duration-300 ${
                focusMode ? 'bg-blue-50' : 'bg-white'
              }`}
              placeholder="Start writing your introduction here..."
              onChange={handleTextChange}
              onFocus={() => setFocusMode(true)}
              onBlur={() => setFocusMode(false)}
              autoFocus
              disabled={isSubmitting}
            />

            {/* Position indicators at the bottom with z-index to prevent overlap */}
            <div className="absolute bottom-2 left-3 flex items-center z-10">
              <div className="bg-gray-100 rounded-full h-1.5 w-32">
                <div 
                  className={`h-1.5 rounded-full ${wordCount >= minWords ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(100, (wordCount / minWords) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="absolute bottom-2 right-3 flex items-center space-x-4 text-sm text-gray-500 z-10">
              {isSaving && !isSubmitting && (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              )}
              <span>{wordCount} words</span>
              <span>{characterCount} chars</span>
            </div>
          </>
        )}
      </div>
      
     
    </div>
  );  
};

WritingArea.propTypes = {
  textAreaRef: PropTypes.object.isRequired,
  onSubmit: PropTypes.func
};

export default WritingArea;