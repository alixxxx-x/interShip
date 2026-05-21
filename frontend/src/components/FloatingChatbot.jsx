import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, X, Send, Loader2, Sparkles, HelpCircle, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';
import { useTheme } from '@/components/theme-provider';
import api from '@/api/api';
import { ACCESS_TOKEN } from '@/constants';

export default function FloatingChatbot() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const location = useLocation();
  
  const [isStudent, setIsStudent] = useState(false);
  const [studentId, setStudentId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      setIsStudent(false);
      return;
    }
    
    api
      .get("/auth/profile/")
      .then((res) => {
        setIsStudent(res.data.role === "STUDENT");
        setStudentId(res.data.id);
      })
      .catch(() => {
        setIsStudent(false);
      });
  }, [location.pathname]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'model',
      text: 'Hello! 👋 I am Internia\'s AI Assistant. Ask me anything about finding internships, building your digital CV, or how the matching process works!'
    }
  ]);
  const [question, setQuestion] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef(null);
  const dk = theme === "dark";

  // Show a welcome tooltip briefly after 3 seconds, if never opened before
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen && !sessionStorage.getItem('chatbot_opened')) {
        setShowTooltip(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Scroll to bottom when history updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isTyping]);

  const renderMessageText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const handleOpenToggle = () => {
    setIsOpen(!isOpen);
    setShowTooltip(false);
    sessionStorage.setItem('chatbot_opened', 'true');
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMsg = { role: 'user', text: question.trim() };
    const currentHistory = [...chatHistory];
    setChatHistory(prev => [...prev, userMsg]);
    const currentQuestion = question.trim();
    setQuestion("");
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:8001/api/chat/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId,
          message: currentQuestion,
          session_id: sessionId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [...prev, { role: 'model', text: data.reply }]);
        if (data.session_id && !sessionId) {
            setSessionId(data.session_id);
        }
      } else {
        setChatHistory(prev => [...prev, { role: 'model', text: "Sorry, I couldn't process your request at the moment. Please try again." }]);
      }
    } catch (error) {
      console.error("Error communicating with AI chatbot:", error);
      setChatHistory(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to the server. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Hide the chatbot on Login and Register routes or if user is not a student
  const hideRoutes = ["/login", "/register"];
  if (hideRoutes.includes(location.pathname) || !isStudent) {
    return null;
  }

  return (
    <>
      {/* CSS Styles */}
      <style>{`
        @keyframes floatPulse {
          0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
        @keyframes slideUp {
          from { transform: translateY(20px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .bot-pulse-ring {
          animation: floatPulse 2s infinite;
        }
        .chatbot-window {
          animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .chat-message-fade {
          animation: fadeIn 0.3s ease forwards;
        }
      `}</style>

      {/* Floating Button Container */}
      <div 
        style={{ 
          position: 'fixed', 
          right: 24, 
          bottom: 24, 
          zIndex: 9999, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-end',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        {/* Welcome Tooltip */}
        {showTooltip && !isOpen && (
          <div 
            style={{
              background: dk ? '#1e1e24' : '#ffffff',
              color: dk ? '#ffffff' : '#1f2937',
              border: `1.5px solid ${dk ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '12.5px',
              fontWeight: 500,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              marginBottom: 12,
              marginRight: 6,
              maxWidth: 240,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              position: 'relative',
              animation: 'fadeIn 0.4s ease forwards'
            }}
          >
            <div style={{ background: 'rgba(37,99,235,0.1)', color: '#2563eb', padding: 4, borderRadius: 8, display: 'flex', alignItems: 'center' }}>
              <Sparkles size={14} />
            </div>
            <span>Ask me anything about internships!</span>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
              style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 0, marginLeft: 6, display: 'flex', alignItems: 'center' }}
            >
              <X size={14} />
            </button>
            {/* Tooltip triangle tail */}
            <div style={{
              position: 'absolute',
              bottom: -6,
              right: 22,
              width: 10,
              height: 10,
              background: dk ? '#1e1e24' : '#ffffff',
              borderRight: `1.5px solid ${dk ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
              borderBottom: `1.5px solid ${dk ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
              transform: 'rotate(45deg)'
            }} />
          </div>
        )}

        {/* Chat Window Panel */}
        {isOpen && (
          <div 
            className="chatbot-window"
            style={{
              width: 'min(380px, calc(100vw - 32px))',
              height: 520,
              maxHeight: 'calc(100vh - 120px)',
              background: dk ? '#0e0e11' : '#ffffff',
              border: `1.5px solid ${dk ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
              borderRadius: 24,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              marginBottom: 16
            }}
          >
            {/* Header */}
            <div 
              style={{
                padding: '16px 20px',
                borderBottom: `1.5px solid ${dk ? 'rgba(255,255,255,0.06)' : '#f3f4f6'}`,
                background: dk ? 'rgba(255,255,255,0.02)' : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <Bot size={18} />
                  <div style={{
                    width: 8,
                    height: 8,
                    background: '#10b981',
                    borderRadius: '50%',
                    position: 'absolute',
                    bottom: -1,
                    right: -1,
                    border: `1.5px solid ${dk ? '#0e0e11' : '#ffffff'}`
                  }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 13.5, fontWeight: 700, margin: 0, color: dk ? '#ffffff' : '#1f2937' }}>
                    Internia AI
                  </h3>
                  <span style={{ fontSize: 10.5, color: '#10b981', fontWeight: 600 }}>
                    Online
                  </span>
                </div>
              </div>
              <button 
                onClick={handleOpenToggle}
                style={{
                  background: 'none',
                  border: 'none',
                  color: dk ? '#a1a1aa' : '#6b7280',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = dk ? 'rgba(255,255,255,0.05)' : '#f3f4f6'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <X size={16} />
              </button>
            </div>

            {/* Conversation Messages */}
            <div 
              style={{
                flex: 1,
                padding: '20px 16px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                background: dk ? '#0e0e11' : '#fcfcfd'
              }}
            >
              {chatHistory.map((msg, idx) => {
                const isBot = msg.role === 'model';
                return (
                  <div 
                    key={idx}
                    className="chat-message-fade"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      flexDirection: isBot ? 'row' : 'row-reverse',
                      maxWidth: '85%',
                      alignSelf: isBot ? 'flex-start' : 'flex-end'
                    }}
                  >
                    {isBot && (
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        background: 'rgba(37,99,235,0.1)',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 2
                      }}>
                        <Bot size={13} />
                      </div>
                    )}
                    <div 
                      style={{
                        padding: '10px 14px',
                        borderRadius: 14,
                        fontSize: 12.5,
                        lineHeight: 1.5,
                        whiteSpace: 'pre-line',
                        background: isBot 
                          ? (dk ? '#18181c' : '#f1f5f9') 
                          : '#2563eb',
                        color: isBot 
                          ? (dk ? '#e4e4e7' : '#1f2937') 
                          : '#ffffff',
                        border: isBot && dk ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                    >
                      {renderMessageText(msg.text)}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    maxWidth: '85%',
                    alignSelf: 'flex-start'
                  }}
                >
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: 'rgba(37,99,235,0.1)',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2
                  }}>
                    <Bot size={13} />
                  </div>
                  <div 
                    style={{
                      padding: '10px 14px',
                      borderRadius: 14,
                      fontSize: 12.5,
                      background: dk ? '#18181c' : '#f1f5f9',
                      color: dk ? '#a1a1aa' : '#6b7280',
                      border: dk ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <Loader2 size={12} className="animate-spin text-blue-500" />
                    <span>AI is formulating response...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Footer */}
            <form 
              onSubmit={handleSend}
              style={{
                padding: '12px 16px',
                borderTop: `1.5px solid ${dk ? 'rgba(255,255,255,0.06)' : '#f3f4f6'}`,
                background: dk ? '#0e0e11' : '#ffffff',
                display: 'flex',
                gap: 8
              }}
            >
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask me a question..."
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: 12,
                  border: `1.5px solid ${dk ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
                  background: dk ? '#18181c' : '#ffffff',
                  color: dk ? '#ffffff' : '#1f2937',
                  fontSize: 12.5,
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = dk ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}
              />
              <button 
                type="submit" 
                disabled={isTyping || !question.trim()}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: (isTyping || !question.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (isTyping || !question.trim()) ? 0.6 : 1,
                  transition: 'transform 0.1s, opacity 0.2s'
                }}
                onMouseDown={(e) => !e.currentTarget.disabled && (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={(e) => !e.currentTarget.disabled && (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        )}

        {/* Round Floating Bot Toggle Button */}
        <button 
          onClick={handleOpenToggle}
          className="bot-pulse-ring"
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
            transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isOpen ? <X size={22} /> : <Bot size={22} />}
        </button>
      </div>
    </>
  );
}
