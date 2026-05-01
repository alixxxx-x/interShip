import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleOpen = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "What is this platform about?",
      answer: "This is a centralized University-Enterprise matching platform designed to automate the internship process. It connects students looking for internships with companies searching for the right profiles, completely digitizing the workflow."
    },
    {
      question: "How do I create a student account?",
      answer: "You can register securely on the platform. We strongly recommend using your official University Email. Once registered, you must fill out your Digital CV with your technical skills, GitHub/Portfolio links, and personal details."
    },
    {
      question: "How do I apply for an internship?",
      answer: "After completing your Digital CV, use the search tool to find internships based on your Wilaya, preferred technologies, or internship type. Click 'Apply' to send your profile directly to the recruiter."
    },
    {
      question: "What happens after a company accepts me?",
      answer: "When a company accepts your application, the University Administration (Internship Office) receives an automatic notification to validate your placement. You don't need to do any manual paperwork!"
    },
    {
      question: "How do I get my 'Convention de Stage' (Internship Agreement)?",
      answer: "Once the University Administration validates your placement, the system automatically generates your official 'Convention de Stage' in PDF format. It will be pre-filled with all necessary data from you, the company, and the university, ready to be downloaded."
    },
    {
      question: "Can companies create multiple internship offers?",
      answer: "Yes, recruiters can create, modify, and delete as many internship offers as they need from their dedicated Company Space."
    }
  ];

  return (
    <div className="min-h-screen bg-white py-20">
        
      <div className="max-w-3xl mx-auto px-6 text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-slate-500">
          Find answers to the most common questions about finding internships and managing your 'Convention de Stage'.
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
                  className={`w-6 h-6 text-slate-400 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              {/* Collapsible Content */}
              <div 
                className={`grid transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
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
          <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Still have questions?</h2>
          <p className="text-slate-500 text-lg mb-10 max-w-2xl mx-auto">
            If you cannot find the answer to your question in our FAQ, you can always ask us directly.
          </p>
          <form 
            className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto" 
            onSubmit={(e) => { 
              e.preventDefault(); 
              alert('Your question has been sent! We will get back to you soon.'); 
              e.target.reset();
            }}
          >
            <input 
              type="text" 
              placeholder="Type your question here..." 
              required
              className="flex-1 px-5 py-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-800 placeholder-slate-400"
            />
            <button 
              type="submit" 
              className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center whitespace-nowrap"
            >
              Send
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
