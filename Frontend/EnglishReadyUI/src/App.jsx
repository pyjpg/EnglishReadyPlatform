import './App.css';
import Header from "./Components/Header";
import React from "react";
import { useMemo, useState, useEffect } from "react";
import { createDirectLine } from "botframework-webchat";
import CustomWebChat from './Components/CustomWebChat';

function App() {
  const [directLine, setDirectLine] = useState(null);
  const [loading, setLoading] = useState(true);
  const directLineToken = "D1eVyRA3fjXlrPKuEIlpdwgrCXJamBHdsLD8IYwGthbqyxa37ZIUJQQJ99BAAC5T7U2AArohAAABAZBSgnJj.63s6iUcTCKuMr4YW81LfBVXPi6BFVQseCwFB7Z64n9dSbjo2P6lXJQQJ99BAAC5T7U2AArohAAABAZBSPPNx";

  // Asynchronous effect to initialize Direct Line connection
  useEffect(() => {
    const fetchDirectLine = async () => {
      try {
        // Use the Direct Line v4 API to create a conversation
        const response = await fetch("https://directline.botframework.com/v3/directline/conversations", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${directLineToken}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (data.conversationId) {
          // Create Direct Line connection with the v4 token
          const dl = createDirectLine({ token: directLineToken });
          setDirectLine(dl);
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to initialize Direct Line:", error);
        setLoading(false); // Ensure loading stops even on error
      }
    };

    fetchDirectLine();
  }, [directLineToken]);

  return (
     <React.Fragment>
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Chat container */}
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
      {/* Input area */}
    </div></React.Fragment>
  );
}

export default App;
