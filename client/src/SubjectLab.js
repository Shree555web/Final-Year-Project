import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faArrowLeft, faRobot, faUser, faPlus, faMessage } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './Chat.css';

const SubjectLab = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const chatEndRef = useRef(null);
  
  // Safely get user data
  const user = JSON.parse(localStorage.getItem('user')) || {};

  // 1. Fetch History & Initial Greeting
  useEffect(() => {
    fetchChatHistory();
    const subjectName = subjectId.replace(/-/g, ' ').toUpperCase();
    
    setMessages([
      { 
        role: 'ai', 
        content: `Hello ${user.username || 'Student'}! Welcome to the ${subjectName} Lab. I've prepared a personalized learning path for you based on your ${user.complexity_level || 'Beginner'} level. What topic within ${subjectName} should we dive into first?` 
      }
    ]);
  }, [subjectId]);

  const fetchChatHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/chat-history/${user.id}`);
      setSessions(res.data);
    } catch (err) {
      console.error("History fetch failed", err);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // 2. Optimized Handle Send
  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const currentInput = input;
    const isFirstMessage = messages.length === 1;
    
    // UI Update immediately
    const userMsg = { role: 'user', content: currentInput };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // STEP 1: If first message, SAVE SESSION FIRST
      if (isFirstMessage) {
        await axios.post('http://localhost:5000/api/new-chat', {
          user_id: user.id,
          subject_name: subjectId,
          title: currentInput.substring(0, 30)
        });
        fetchChatHistory(); // Refresh sidebar
      }

      // STEP 2: Request AI Response
      // We send the current message list PLUS the new user message
      const res = await axios.post('http://localhost:5000/chat', {
        message: currentInput,
        subject: subjectId,
        history: messages, // Send existing history
        userStyle: user.complexity_level || 'Beginner'
      });

      setMessages(prev => [...prev, { role: 'ai', content: res.data.reply }]);
    } catch (err) {
      console.error("Lab Error:", err);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "Connection lost. Please ensure your backend server is running and the GROQ API key is valid." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const startNewSession = () => {
    // Reset messages to just the greeting
    window.location.reload(); 
  };

  return (
    <div className="chat-container">
      {/* --- SIDEBAR --- */}
      <aside className="chat-sidebar">
        <button className="new-chat-btn" onClick={startNewSession}>
          <FontAwesomeIcon icon={faPlus} /> New Lab Session
        </button>
        <div className="history-section">
          <p className="history-label">Recent Study Sessions</p>
          {sessions.length > 0 ? (
            sessions.map(s => (
              <div key={s.id} className="history-item">
                <FontAwesomeIcon icon={faMessage} className="msg-icon" />
                <span className="truncate">{s.title || "Untitled Lab"}</span>
              </div>
            ))
          ) : (
            <p style={{padding: '10px', fontSize: '0.8rem', color: '#666'}}>No sessions yet</p>
          )}
        </div>
      </aside>

      {/* --- MAIN LAB --- */}
      <main className="chat-main">
        <header className="lab-header">
          <h3>{subjectId.replace(/-/g, ' ').toUpperCase()} AI LAB</h3>
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            <FontAwesomeIcon icon={faArrowLeft} /> Exit Lab
          </button>
        </header>

        <div className="message-list">
          {messages.map((msg, i) => (
            <div key={i} className={`message-row ${msg.role}`}>
              <div className="avatar">
                <FontAwesomeIcon icon={msg.role === 'ai' ? faRobot : faUser} />
              </div>
              <div className="message-bubble">{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div className="message-row ai">
              <div className="avatar"><FontAwesomeIcon icon={faRobot} /></div>
              <div className="message-bubble typing">AI is thinking...</div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form className="input-area" onSubmit={handleSend}>
          <div className="input-wrapper">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default SubjectLab;