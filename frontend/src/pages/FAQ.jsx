import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Send, User, Bot, Loader2 } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';

export default function FAQ() {
    const { t } = useLanguage();
    const [openIndex, setOpenIndex] = useState(null);
    const [activeCategory, setActiveCategory] = useState("General Questions");
    
    // Chatbot State
    const [chatHistory, setChatHistory] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [question, setQuestion] = useState("");

    const toggleOpen = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        const userMessage = { role: 'user', text: question.trim() };
        setChatHistory(prev => [...prev, userMessage]);
        setQuestion("");
        setIsTyping(true);

        try {
            const response = await fetch('http://localhost:8000/api/chat/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: question.trim(),
                    chat_history: chatHistory
                })
            });

            const data = await response.json();
            if (data.success) {
                setChatHistory(prev => [...prev, { role: 'model', text: data.response }]);
            } else {
                setChatHistory(prev => [...prev, { role: 'model', text: "I'm sorry, I couldn't process your request at the moment." }]);
            }
        } catch (error) {
            setChatHistory(prev => [...prev, { role: 'model', text: "I encountered a network error. Please try again." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const faqData = [
        {
            category: "General Questions",
            items: [
                { id: "q1", question: t("faqQ1") || "What is this platform about?", answer: t("faqA1") || "This is a centralized University-Enterprise matching platform designed to automate the internship process. It connects students looking for internships with companies searching for the right profiles, completely digitizing the workflow." }
            ]
        },
        {
            category: "Student & Accounts",
            items: [
                { id: "q2", question: t("faqQ2") || "How do I create a student account?", answer: t("faqA2") || "You can register securely on the platform. We strongly recommend using your official University Email. Once registered, you must fill out your Digital CV with your technical skills, GitHub/Portfolio links, and personal details." },
                { id: "q3", question: t("faqQ3") || "How do I apply for an internship?", answer: t("faqA3") || "After completing your Digital CV, use the search tool to find internships based on your Wilaya, preferred technologies, or internship type. Click 'Apply' to send your profile directly to the recruiter." }
            ]
        },
        {
            category: "Internship Process",
            items: [
                { id: "q4", question: t("faqQ4") || "What happens after a company accepts me?", answer: t("faqA4") || "When a company accepts your application, the University Administration (Internship Office) receives an automatic notification to validate your placement. You don't need to do any manual paperwork!" },
                { id: "q5", question: t("faqQ5") || "How do I get my 'Convention de Stage'?", answer: t("faqA5") || "Once the University Administration validates your placement, the system automatically generates your official 'Convention de Stage' in PDF format. It will be pre-filled with all necessary data from you, the company, and the university, ready to be downloaded." }
            ]
        },
        {
            category: "Companies & Recruiters",
            items: [
                { id: "q6", question: t("faqQ6") || "Can companies create multiple internship offers?", answer: t("faqA6") || "Yes, recruiters can create, modify, and delete as many internship offers as they need from their dedicated Company Space." }
            ]
        }
    ];

    const scrollToSection = (catName) => {
        setActiveCategory(catName);
        const el = document.getElementById(`cat-${catName}`);
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div className="faq-page">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
                
                .faq-page {
                    font-family: 'Inter', -apple-system, sans-serif;
                    background-color: hsl(var(--background));
                    color: hsl(var(--foreground));
                    min-height: 100vh;
                    padding-bottom: 100px;
                    transition: background-color 0.3s, color 0.3s;
                }
                .faq-header {
                    background-color: hsl(var(--muted));
                    padding: 60px 40px;
                    border-bottom: 1px solid hsl(var(--border));
                    transition: background-color 0.3s, border-color 0.3s;
                }
                .faq-header-inner {
                    max-width: 1000px;
                    margin: 0 auto;
                }
                .faq-title {
                    font-size: 32px;
                    font-weight: 500;
                    margin: 0;
                    color: hsl(var(--foreground));
                    letter-spacing: -0.02em;
                }
                .faq-main {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 60px 40px;
                    display: flex;
                    gap: 80px;
                }
                .faq-sidebar {
                    width: 200px;
                    flex-shrink: 0;
                    position: sticky;
                    top: 100px;
                    align-self: flex-start;
                }
                .cat-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .cat-item {
                    font-size: 13px;
                    font-weight: 500;
                    color: hsl(var(--foreground) / 0.6);
                    cursor: pointer;
                    transition: color 0.2s;
                    text-align: left;
                    background: none;
                    border: none;
                    padding: 0;
                    outline: none;
                }
                .cat-item:hover {
                    color: hsl(var(--foreground));
                }
                .cat-item.active {
                    color: hsl(var(--foreground));
                    font-weight: 600;
                }
                .faq-content {
                    flex: 1;
                }
                .effective-date {
                    font-size: 11px;
                    color: hsl(var(--foreground) / 0.5);
                    margin-bottom: 40px;
                }
                .faq-section {
                    margin-bottom: 48px;
                }
                .section-title {
                    font-size: 16px;
                    font-weight: 500;
                    margin: 0 0 16px 0;
                    color: hsl(var(--foreground) / 0.8);
                }
                .faq-list {
                    border-top: 1px solid hsl(var(--border));
                }
                .faq-item {
                    border-bottom: 1px solid hsl(var(--border));
                }
                .faq-question {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 0;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                    color: hsl(var(--foreground));
                    background: transparent;
                    border: none;
                    width: 100%;
                    text-align: left;
                    outline: none;
                }
                .faq-answer {
                    font-size: 13px;
                    color: hsl(var(--foreground) / 0.7);
                    line-height: 1.6;
                    padding-bottom: 24px;
                    padding-right: 40px;
                }
                
                /* Chat section styles to match aesthetic */
                .chat-section {
                    max-width: 1000px;
                    margin: 80px auto 0;
                    padding: 0 40px;
                    border-top: 1px solid hsl(var(--border));
                    padding-top: 60px;
                }
                .chat-header {
                    font-size: 20px;
                    font-weight: 500;
                    margin-bottom: 8px;
                    color: hsl(var(--foreground));
                }
                .chat-desc {
                    font-size: 14px;
                    color: hsl(var(--foreground) / 0.6);
                    margin-bottom: 32px;
                }
                .chat-box {
                    background-color: hsl(var(--muted));
                    border: 1px solid hsl(var(--border));
                    border-radius: 12px;
                    padding: 24px;
                    margin-bottom: 24px;
                    max-height: 400px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .chat-msg {
                    display: flex;
                    gap: 12px;
                    max-width: 80%;
                }
                .msg-user {
                    align-self: flex-end;
                    flex-direction: row-reverse;
                }
                .msg-bot {
                    align-self: flex-start;
                }
                .msg-bubble {
                    padding: 12px 16px;
                    border-radius: 8px;
                    font-size: 13px;
                    line-height: 1.5;
                }
                .bubble-user {
                    background-color: hsl(var(--foreground));
                    color: hsl(var(--background));
                }
                .bubble-bot {
                    background-color: hsl(var(--background));
                    border: 1px solid hsl(var(--border));
                    color: hsl(var(--foreground) / 0.9);
                }
                .chat-input-row {
                    display: flex;
                    gap: 12px;
                }
                .chat-input {
                    flex: 1;
                    padding: 14px 16px;
                    border-radius: 8px;
                    border: 1px solid hsl(var(--border));
                    background-color: hsl(var(--background));
                    color: hsl(var(--foreground));
                    font-family: 'Inter', sans-serif;
                    font-size: 13px;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .chat-input:focus {
                    border-color: hsl(var(--foreground));
                }
                .chat-submit {
                    background-color: hsl(var(--foreground));
                    color: hsl(var(--background));
                    border: none;
                    border-radius: 8px;
                    padding: 0 24px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: opacity 0.2s;
                }
                .chat-submit:hover {
                    opacity: 0.9;
                }
                .chat-submit:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .faq-main {
                        flex-direction: column;
                        gap: 40px;
                    }
                    .faq-sidebar {
                        width: 100%;
                        position: static;
                    }
                    .cat-list {
                        flex-direction: row;
                        flex-wrap: wrap;
                    }
                }
            `}</style>

            {/* Header */}
            <div className="faq-header">
                <div className="faq-header-inner">
                    <h1 className="faq-title">Frequently Asked Questions</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="faq-main">
                {/* Sidebar */}
                <div className="faq-sidebar">
                    <div className="cat-list">
                        {faqData.map((cat, idx) => (
                            <button 
                                key={idx}
                                className={`cat-item ${activeCategory === cat.category ? 'active' : ''}`}
                                onClick={() => scrollToSection(cat.category)}
                            >
                                {cat.category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="faq-content">
                    <div className="effective-date">Effective Date: July 8, 2025</div>
                    
                    {faqData.map((section, sIdx) => (
                        <div key={sIdx} id={`cat-${section.category}`} className="faq-section">
                            <h2 className="section-title">{section.category}</h2>
                            <div className="faq-list">
                                {section.items.map((item) => {
                                    const isOpen = openIndex === item.id;
                                    return (
                                        <div key={item.id} className="faq-item">
                                            <button 
                                                className="faq-question" 
                                                onClick={() => toggleOpen(isOpen ? null : item.id)}
                                            >
                                                <span>{item.question}</span>
                                                {isOpen ? <ChevronUp size={16} color="#999" /> : <ChevronDown size={16} color="#999" />}
                                            </button>
                                            {isOpen && (
                                                <div className="faq-answer">
                                                    {item.answer}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chatbot Section */}
            <div className="chat-section">
                <h2 className="chat-header">{t("stillHaveQuestions") || "Still have questions?"}</h2>
                <div className="chat-desc">{t("stillHaveQuestionsDesc") || "Ask our AI assistant and get instant answers about the Internia platform."}</div>
                
                {chatHistory.length > 0 && (
                    <div className="chat-box">
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`chat-msg ${msg.role === 'user' ? 'msg-user' : 'msg-bot'}`}>
                                <div className={`msg-bubble ${msg.role === 'user' ? 'bubble-user' : 'bubble-bot'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="chat-msg msg-bot">
                                <div className="msg-bubble bubble-bot" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Loader2 size={14} className="animate-spin text-slate-400" />
                                    <span style={{ color: '#999' }}>Thinking...</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <form className="chat-input-row" onSubmit={handleChatSubmit}>
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder={t("typeQuestion") || "Type your question here..."}
                        required
                        disabled={isTyping}
                        className="chat-input"
                    />
                    <button type="submit" disabled={isTyping} className="chat-submit">
                        {isTyping ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Send</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
