import React from 'react';

export default function StudentGuidelines() {
  const guidelines = [
    {
      title: "1. Create Your Digital CV",
      content: "Register securely (preferably using your University Email) and build your digital CV. Make sure to accurately select your technical skills (e.g., React, Java, Python) and include links to your GitHub or Portfolio. A complete profile is essential for recruiters to evaluate your application."
    },
    {
      title: "2. Search & Find Your Match",
      content: "Use the advanced search tools to find internship offers that fit your profile. You can filter opportunities by Wilaya, technology stack, and internship type to easily connect with the right companies."
    },
    {
      title: "3. Apply & Track Progress",
      content: "Send your profile directly to companies with a single click. The company recruiter will review your digital CV. You can track your application status to see if you are accepted or refused."
    },
    {
      title: "4. Automated Convention de Stage",
      content: "Say goodbye to manual paperwork! Once a company accepts your application, the university administration is automatically notified. After they validate your placement, the system will automatically generate your official 'Convention de Stage' in PDF format, pre-filled with all your details."
    }
  ];

  return (
    <div className="min-h-screen bg-white py-20">
      <div className="max-w-3xl mx-auto px-6">

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Student Guidelines
          </h1>
          <p className="text-lg text-slate-500">
            Follow these steps to complete your digital profile, match with the perfect company, and easily generate your official internship agreement.
          </p>
        </div>

        <div className="space-y-12">
          {guidelines.map((item, index) => (
            <div key={index} className="border-t pt-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                {item.title}
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                {item.content}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
