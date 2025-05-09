import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import api from '../api'; // Your configured axios instance

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [aiFullText, setAiFullText] = useState(''); // Stores full AI response
  const [typingIndex, setTypingIndex] = useState(0);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/chat/history');
        if (response.data && response.data.history) {
          setMessages(response.data.history);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages update
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Typing effect for the latest AI message
    if (aiFullText && typingIndex < aiFullText.length) {
      const interval = setInterval(() => {
        setTypingIndex((prev) => prev + 1);
      }, 50); // Adjust typing speed here
      return () => clearInterval(interval);
    }
  }, [aiFullText, typingIndex]);

  const handleSend = async (text) => {
    const userMessage = {
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');
    setTypingIndex(0);
    setAiFullText(''); // Clear previous AI response

    try {
      const response = await api.post('/chat/messages', { message: text });

      if (response.data && response.data.messages) {
        const aiMessages = response.data.messages.filter((m) => m.sender === 'ai');
        const latestAiMsg = aiMessages[aiMessages.length - 1];

        if (latestAiMsg) {
          // Add the latest AI message to the messages array
          setMessages((prev) => [
            ...prev,
            {
              sender: 'ai',
              text: latestAiMsg.text, // Store the full AI response directly
              timestamp: latestAiMsg.timestamp || new Date().toISOString(),
            },
          ]);

          // Start typing effect on the new AI message
          setAiFullText(latestAiMsg.text);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      handleSend(newMessage.trim());
    }
  };

  const handleAskAI = (prompt) => {
    handleSend(prompt);
  };

  return (
    <div className="chat-container">
      <div className="message-list" ref={chatContainerRef}>
        {messages.map((msg, index) => {
          const isLatestAi = msg.sender === 'ai' && index === messages.length - 1;
          const displayText =
            isLatestAi && aiFullText
              ? aiFullText.substring(0, typingIndex) // Typing effect for the latest AI message
              : msg.text; // Show full text for previous AI messages

          return (
            <div key={index} className={`message-container ${msg.sender}`}>
              <div className="avatar">{msg.sender==="user"? "U":"AI"}</div>
              <div className="message-content">
                {displayText}
                <div className="timestamp">
                  {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="message-input-area">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Write your journal entry..."
        />
        <button type="submit">Send</button>
      </form>

      <div className="ai-actions">
        <button onClick={() => handleAskAI('Summarize my day')}>Summarize my day</button>
        <button onClick={() => handleAskAI('Give me motivation for tomorrow')}>Give me motivation for tomorrow</button>
        <button onClick={() => handleAskAI('What can I improve this week?')}>What can I improve this week?</button>
      </div>
    </div>
  );
};

export default Chat;
