import { useRef, useEffect, useState } from 'react';
import { Components } from 'botframework-webchat';
import PropTypes from 'prop-types';
import WritingMode from './Writing/WritingMode'; 

function CustomWebChat({ directLine }) {
  const chatContainerRef = useRef(null);
  const transcriptRef = useRef(null);
  const textAreaRef = useRef(null);
  const [isWritingMode, setIsWritingMode] = useState(false);
  const [grade, setGrade] = useState(65);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [grammarAnalysis, setGrammarAnalysis] = useState(null);
  const [lexicalAnalysis, setLexicalAnalysis] = useState(null);
  const [taskAchievementAnalysis, setTaskAchievementAnalysis] = useState(null);
  const [coherenceAnalysis, setCoherenceAnalysis] = useState(null);
  useEffect(() => {
    const scrollToBottom = () => {
      if (transcriptRef.current) {
        transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
      }
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          const addedNode = mutation.addedNodes[0];
          if (addedNode.tagName === 'ARTICLE') {
            const messageContent = addedNode.innerText.replace('Bot said:', '').trim().toLowerCase();
            console.log('Bot message:', messageContent);
            
            if (messageContent.includes('please write your introduction')) {
              setIsWritingMode(true);
              setTimeout(() => {
                textAreaRef.current?.focus();
              }, 100);
            }
          }
          scrollToBottom();
        }
      });
    });

    if (transcriptRef.current) {
      observer.observe(transcriptRef.current, {
        childList: true,
        subtree: true
      });
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (text) => {
    if (!text?.trim()) {
      alert('Please write your response before submitting.');
      return;
    }

    setSubmissionStatus(null);
    setGrammarAnalysis(null);
    setTaskAchievementAnalysis(null);
    setLexicalAnalysis(null); 
    setCoherenceAnalysis(null);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/submit-writing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          task_type: 'argument',
          question_number: 3
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit writing');
      }

      const data = await response.json();
      console.log('Response from backend:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      
      setGrade(data.grade || 75);
      setGrammarAnalysis(data.grammar_analysis);
      setLexicalAnalysis(data.lexical_analysis);
      setTaskAchievementAnalysis(data.task_achievement_analysis); // Fixed this line
      setCoherenceAnalysis(data.coherence_analysis);
      setSubmissionStatus('success');

      if (directLine) {
        await directLine.postActivity({
          type: 'message',
          from: { id: 'user', name: 'User' },
          text: `Writing task submitted successfully. Grammar Score: ${data.grammar_analysis?.overall_score.toFixed(1)}/9.0`,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Error submitting writing:', error);
      setSubmissionStatus('error');
      alert('There was an error submitting your writing. Please try again.');
    }
  };

  if (isWritingMode) {
    return (
      <WritingMode
        textAreaRef={textAreaRef}
        grade={grade}
        submissionStatus={submissionStatus}
        handleSubmit={handleSubmit}
        setIsWritingMode={setIsWritingMode}
        grammarAnalysis={grammarAnalysis}
        lexicalAnalysis={lexicalAnalysis}
        coherenceAnalysis={coherenceAnalysis}
        taskAchievementAnalysis={taskAchievementAnalysis} // Added this prop
      />
    );
  }

  return (
    <div ref={chatContainerRef} className="fixed inset-0 flex flex-col bg-gray-100">
      <Components.Composer directLine={directLine}>
        <Components.AccessKeySinkSurface className="flex flex-col h-full relative">
          <div className="absolute top-2 right-2 z-10">
            <Components.BasicToaster />
          </div>

          <div 
            ref={transcriptRef}
            className="flex-1 overflow-y-auto bg-white p-4"
          >
            <Components.BasicTranscript />
          </div>

          <div className="py-2 text-sm text-gray-500 text-center bg-white">
            <Components.BasicConnectivityStatus />
          </div>

          <div className="border-t p-4 bg-white">
            <div className="flex items-center gap-1 bg-gray-100 rounded-full px-4 py-2">
              <Components.BasicSendBox 
                className="w-full bg-transparent outline-none"
                disabled={isWritingMode}
              />
            </div>
          </div>
        </Components.AccessKeySinkSurface>
      </Components.Composer>
    </div>
  );
}

CustomWebChat.propTypes = {
  directLine: PropTypes.object.isRequired,
};

export default CustomWebChat;