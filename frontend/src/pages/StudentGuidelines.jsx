import React from 'react';
import { useLanguage } from '@/components/language-provider';

export default function StudentGuidelines() {
  const { t } = useLanguage();
  const guidelines = [
    {
      title: t("guide1Title") || "1. Create Your Digital CV",
      content: t("guide1Content") || "Register securely (preferably using your University Email) and build your digital CV. Make sure to accurately select your technical skills (e.g., React, Java, Python) and include links to your GitHub or Portfolio. A complete profile is essential for recruiters to evaluate your application."
    },
    {
      title: t("guide2Title") || "2. Search & Find Your Match",
      content: t("guide2Content") || "Use the advanced search tools to find internship offers that fit your profile. You can filter opportunities by Wilaya, technology stack, and internship type to easily connect with the right companies."
    },
    {
      title: t("guide3Title") || "3. Apply & Track Progress",
      content: t("guide3Content") || "Send your profile directly to companies with a single click. The company recruiter will review your digital CV. You can track your application status to see if you are accepted or refused."
    },
    {
      title: t("guide4Title") || "4. Automated Convention de Stage",
      content: t("guide4Content") || "Say goodbye to manual paperwork! Once a company accepts your application, the university administration is automatically notified. After they validate your placement, the system will automatically generate your official 'Convention de Stage' in PDF format, pre-filled with all your details."
    }
  ];

  return (
    <div className="min-h-screen bg-white py-20">
      <div className="max-w-3xl mx-auto px-6">

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            {t("guidelinesTitle")}
          </h1>
          <p className="text-lg text-slate-500">
            {t("guidelinesDesc")}
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
