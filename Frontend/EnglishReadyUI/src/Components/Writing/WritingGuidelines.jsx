const WritingGuidelines = () => {
    const guidelines = [
      'Paraphrase the main question',
      'Provide an overview of the graph',
      'Use appropriate academic language'
    ];
  
    return (
      <div className="bg-blue-50 rounded-lg p-3 mb-4 w-64">
        <h3 className="text-sm font-medium text-blue-700 mb-2">Remember to:</h3>
        <ul className="space-y-1.5">
          {guidelines.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-blue-600">
              <svg className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default WritingGuidelines;