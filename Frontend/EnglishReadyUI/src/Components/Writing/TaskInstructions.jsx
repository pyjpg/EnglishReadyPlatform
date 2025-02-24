const TaskInstructions = () => {
    return (
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
    );
  };
  
  export default TaskInstructions;