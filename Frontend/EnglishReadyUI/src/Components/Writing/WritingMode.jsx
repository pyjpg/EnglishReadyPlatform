import PropTypes from 'prop-types';
import WritingSidebar from './WritingSidebar';
import TaskInstructions from './TaskInstructions';
const taskImage = new URL('../../assets/image.jpg', import.meta.url).href;

const WritingMode = ({ 
  textAreaRef, 
  grade, 
  submissionStatus, 
  handleSubmit, 
  setIsWritingMode,
  grammarAnalysis,
  lexicalAnalysis,
  taskAchievementAnalysis,
  coherenceAnalysis,
}) => {
  console.log("Task Achievement Data:", taskAchievementAnalysis);
  console.log("Grammar Analysis Data:", grammarAnalysis);
  console.log("Lexical Analysis Data:", lexicalAnalysis);
  console.log("Coherence Analysis Data:", coherenceAnalysis);
  return (
    <div className="fixed inset-0 bg-white flex">
      {/* Main Content */}
      <div className="flex-1 p-6 flex flex-col">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">IELTS Writing - Task 1 - Question 3/6</h2>
        
        {/* Task Instructions */}
        <TaskInstructions />
       
          
      

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
        taskAchievementAnalysis={taskAchievementAnalysis}
        coherenceAnalysis={coherenceAnalysis}
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
  taskAchievementAnalysis: PropTypes.object,
  coherenceAnalysis: PropTypes.object,
};

export default WritingMode;