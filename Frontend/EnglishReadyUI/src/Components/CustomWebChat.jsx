import { useRef, useEffect, useState } from 'react';
import { Components } from 'botframework-webchat';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function CustomWebChat({ directLine }) {
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);
  const transcriptRef = useRef(null);
  const [writingTaskData, setWritingTaskData] = useState(null);

  // Mutation observer setup
  useEffect(() => {
    const scrollToBottom = () => {
      if (transcriptRef.current) {
        transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
      }
    };

    const handleBotMessage = (messageContent) => {
      if (messageContent.includes('please write your introduction')) {
        navigate('/writing', {
          state: {
            questionNumber: 3,
            taskType: 'argument',
            initialPrompt: messageContent
          }
        });
      }
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          const addedNode = mutation.addedNodes[0];
          if (addedNode.tagName === 'ARTICLE') {
            const messageContent = addedNode.innerText
              .replace('Bot said:', '')
              .trim()
              .toLowerCase();
            handleBotMessage(messageContent);
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
  }, [navigate]);

  const handleWritingSubmission = async (text) => {
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

      if (!response.ok) throw new Error('Failed to submit writing');
      
      const data = await response.json();
      setWritingTaskData(data);

      if (directLine) {
        await directLine.postActivity({
          type: 'message',
          from: { id: 'user', name: 'User' },
          text: `Writing submitted - Grammar: ${data.grammar_analysis?.overall_score.toFixed(1)}/9.0`,
          timestamp: new Date().toISOString()
        });
      }

      navigate(-1); // Return to chat after submission

    } catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting writing. Please try again.');
    }
  };

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