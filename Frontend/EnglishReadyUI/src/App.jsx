import React, { useState, useEffect, useRef } from "react";
import { Route, Routes } from "react-router-dom";
import { createDirectLine } from "botframework-webchat";
import CustomWebChat from "./Components/WebChat/CustomWebChat";
import WritingMode from "./Components/Writing/WritingMode/WritingMode";

function App() {
  const [directLine, setDirectLine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grade, setGrade] = useState(0);
  const [submissionStatus, setSubmissionStatus] = useState("");
  const [isWritingMode, setIsWritingMode] = useState(false);
  const textAreaRef = useRef(null);

  // Simulated analysis data (replace with real logic)
  const grammarAnalysis = {};
  const lexicalAnalysis = {};
  const taskAchievementAnalysis = {};
  const coherenceAnalysis = {};
  const apiKey = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    const fetchDirectLine = async () => {
      try {
        const response = await fetch("https://directline.botframework.com/v3/directline/conversations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (data.conversationId) {
          const dl = createDirectLine({ token: apiKey });
          setDirectLine(dl);
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to initialize Direct Line:", error);
        setLoading(false);
      }
    };

    fetchDirectLine();
  }, [apiKey]);

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <div className="flex flex-col h-screen bg-white">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <p>Loading Chat...</p>
              ) : directLine ? (
                <div style={{ height: "500px", width: "100%", border: "1px solid #ccc" }}>
                  <CustomWebChat directLine={directLine} />
                </div>
              ) : (
                <p>Error loading chat.</p>
              )}
            </div>
          </div>
        }
      />
      
      <Route 
        path="/writing" 
        element={
          <div className="flex flex-col h-screen bg-white">
            {directLine && (
              <WritingMode 
                directLine={directLine}
                textAreaRef={textAreaRef}
                grade={grade}
                submissionStatus={submissionStatus}
                handleSubmit={(essay) => console.log("Submitted essay:", essay)}
                setIsWritingMode={setIsWritingMode}
                grammarAnalysis={grammarAnalysis}
                lexicalAnalysis={lexicalAnalysis}
                taskAchievementAnalysis={taskAchievementAnalysis}
                coherenceAnalysis={coherenceAnalysis}
              />
            )}
          </div>
        }
      />
    </Routes>
  );
}

export default App;
