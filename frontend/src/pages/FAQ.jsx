import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Send, User, Bot, Loader2 } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';

export default function FAQ() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(null);
  {/* save chat msgs, they dispear once refreshing 
      is chat replying?
      text that user types
  */ }
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [question, setQuestion] = useState("");

  const toggleOpen = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  {/* linking between use interface & Gemini API */ }
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    // add qst to array
    const userMessage = { role: 'user', text: question.trim() };
    setChatHistory(prev => [...prev, userMessage]);
    setQuestion("");
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          chat_history: chatHistory
        })
      });

      const data = await response.json();

      if (data.success) {
        setChatHistory(prev => [...prev, { role: 'model', text: data.response }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'model', text: "I'm sorry, I couldn't process your request at the moment. Please try again later." }]);
      }
    } catch (error) {
      console.error("Error communicating with AI:", error);
      setChatHistory(prev => [...prev, { role: 'model', text: "I encountered a network error. Please check your connection and try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const faqs = [
    {
      question: t("faqQ1") || "What is this platform about?",
      answer: t("faqA1") || "This is a centralized University-Enterprise matching platform designed to automate the internship process. It connects students looking for internships with companies searching for the right profiles, completely digitizing the workflow."
    },
    {
      question: t("faqQ2") || "How do I create a student account?",
      answer: t("faqA2") || "You can register securely on the platform. We strongly recommend using your official University Email. Once registered, you must fill out your Digital CV with your technical skills, GitHub/Portfolio links, and personal details."
    },
    {
      question: t("faqQ3") || "How do I apply for an internship?",
      answer: t("faqA3") || "After completing your Digital CV, use the search tool to find internships based on your Wilaya, preferred technologies, or internship type. Click 'Apply' to send your profile directly to the recruiter."
    },
    {
      question: t("faqQ4") || "What happens after a company accepts me?",
      answer: t("faqA4") || "When a company accepts your application, the University Administration (Internship Office) receives an automatic notification to validate your placement. You don't need to do any manual paperwork!"
    },
    {
      question: t("faqQ5") || "How do I get my 'Convention de Stage' (Internship Agreement)?",
      answer: t("faqA5") || "Once the University Administration validates your placement, the system automatically generates your official 'Convention de Stage' in PDF format. It will be pre-filled with all necessary data from you, the company, and the university, ready to be downloaded."
    },
    {
      question: t("faqQ6") || "Can companies create multiple internship offers?",
      answer: t("faqA6") || "Yes, recruiters can create, modify, and delete as many internship offers as they need from their dedicated Company Space."
    }
  ];

  return (
    <div className="min-h-screen bg-white py-20">

      <div className="max-w-3xl mx-auto px-6 text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
          {t("faqTitle")}
        </h1>
        <p className="text-lg text-slate-500">
          {t("faqDesc")}
        </p>
      </div>

      <div className="px-8 md:px-16 lg:px-24">
        <div className="max-w-4xl space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors overflow-hidden">
              <button
                onClick={() => toggleOpen(index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <h2 className="text-xl font-semibold text-slate-900 pr-8">
                  {index + 1}. {faq.question}
                </h2>
                <ChevronDown
                  className={`w-6 h-6 text-slate-400 flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {/* Collapsible Content */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${openIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-6 text-slate-600 leading-relaxed text-lg">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ask a Question Section */}
      <div className="mt-32 pb-12">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">{t("stillHaveQuestions")}</h2>
          <p className="text-slate-500 text-lg mb-10 max-w-2xl mx-auto">
            {t("stillHaveQuestionsDesc")}
          </p>
          {/* Chat History */}
          {chatHistory.length > 0 && (
            <div className="max-w-2xl mx-auto mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-4 max-h-96 overflow-y-auto">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Bot size={18} className="text-indigo-600" />
                    </div>
                  )}
                  <div className={`px-4 py-2 rounded-2xl max-w-[80%] whitespace-pre-wrap ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}>
                    {msg.text}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <User size={18} className="text-slate-600" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Bot size={18} className="text-indigo-600" />
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 rounded-tl-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-slate-400" />
                    <span className="text-sm text-slate-400">{t("thinking")}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* replace static msg with api call to gemini */}
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
            onSubmit={handleChatSubmit}
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t("typeQuestion")}
              required
              disabled={isTyping}
              className="flex-1 px-5 py-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-800 placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isTyping}
              className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTyping ? <Loader2 size={20} className="animate-spin" /> : <><Send size={18} className="mr-2" /> {t("send")}</>}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
