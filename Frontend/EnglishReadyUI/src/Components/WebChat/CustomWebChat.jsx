import React, { useRef, useEffect } from 'react';
import { Components } from 'botframework-webchat';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function CustomWebChat({ directLine }) {
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);
  const transcriptRef = useRef(null);
  
  useEffect(() => {
    const scrollToBottom = () => {
      if (transcriptRef.current) {
        transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
      }
    };

    const handleBotMessage = (messageContent) => {
  
      
      if (messageContent.includes('please write your')) {
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
            const nodeContent = addedNode.textContent || addedNode.innerText;
            
            if (nodeContent) {
              const messageContent = nodeContent
                .replace(/Bot said:/i, '') 
                .trim()
                .toLowerCase();
              handleBotMessage(messageContent);
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
  }, [navigate]);

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