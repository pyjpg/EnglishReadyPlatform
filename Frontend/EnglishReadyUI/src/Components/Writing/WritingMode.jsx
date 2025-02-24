import PropTypes from 'prop-types';
import WritingSidebar from './WritingSidebar';

const WritingMode = ({ 
  textAreaRef, 
  grade, 
  submissionStatus, 
  handleSubmit, 
  setIsWritingMode,
  grammarAnalysis,
  lexicalAnalysis 
}) => {
  return (
    <div className="fixed inset-0 bg-white flex">
      {/* Main Content */}
      <div className="flex-1 p-6 flex flex-col">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">IELTS Writing - Task 1 - Question 3/6</h2>
        
        {/* Task Instructions */}
        <div className="bg-white border rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-800 mb-4">Task Instructions</h3>
          <div className="flex gap-6">
            <div className="flex-1">
              <p className="text-gray-600 mb-4">
                The graph above shows population growth in different regions. Write a report 
                describing the key features and make comparisons where relevant. 
                You should write at least 150 words.
              </p>
              
              <div className="text-sm text-gray-500 space-y-2">
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
            </div>
            
            <div className="w-96 bg-gray-100 rounded-lg flex items-center justify-center">
              <img 
                src="/api/placeholder/400/320"
                alt="Task Graph" 
                className="max-w-full h-auto rounded"
              />
            </div>
          </div>
        </div>

        {/* Writing Guidelines */}
        <div className="bg-blue-50 rounded-lg p-3 mb-4 w-64">
          <h3 className="text-sm font-medium text-blue-700 mb-2">Remember to:</h3>
          <ul className="space-y-1.5">
            {['Paraphrase the main question', 'Provide an overview of the graph', 'Use appropriate academic language'].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-blue-600">
                <svg className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Writing Area */}
        <div className="flex-1 relative">
          <textarea
            ref={textAreaRef}
            className="absolute inset-0 w-full h-full p-4 text-lg border-t border-r border-b border-gray-200 border-l-4 border-l-blue-500 rounded-lg resize-none focus:ring-0 focus:outline-none"
            placeholder="Start writing your introduction here..."
            autoFocus
          />
        </div>
      </div>

      {/* Right Sidebar */}
      <WritingSidebar
        grade={grade}
        submissionStatus={submissionStatus}
        handleSubmit={() => handleSubmit(textAreaRef.current?.value)}
        setIsWritingMode={setIsWritingMode}
        grammarAnalysis={grammarAnalysis}
        lexicalAnalysis={lexicalAnalysis}
      />
    </div>
  );
};

WritingMode.propTypes = {
  textAreaRef: PropTypes.object.isRequired,
  grade: PropTypes.number.isRequired,
  submissionStatus: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired,
  setIsWritingMode: PropTypes.func.isRequired,
  grammarAnalysis: PropTypes.object,
  lexicalAnalysis: PropTypes.object,
};

export default WritingMode;