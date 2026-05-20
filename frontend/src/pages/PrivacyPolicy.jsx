import React, { useState } from 'react';

export default function PrivacyPolicy() {
    const [activeSection, setActiveSection] = useState("Introduction");

    const sections = [
        { id: "intro", title: "1. Introduction" },
        { id: "collect", title: "2. Information We Collect" },
        { id: "use", title: "3. How We Use Your Information" },
        { id: "share", title: "4. Sharing Your Information" },
        { id: "cookies", title: "5. Cookies & Tracking Technologies" },
        { id: "retention", title: "6. Data Retention" },
        { id: "contact", title: "7. Contact Us" }
    ];

    const scrollToSection = (id, title) => {
        setActiveSection(title);
        const el = document.getElementById(id);
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div className="privacy-page">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
                
                .privacy-page {
                    font-family: 'Inter', -apple-system, sans-serif;
                    background-color: hsl(var(--background));
                    color: hsl(var(--foreground));
                    min-height: 100vh;
                    padding-bottom: 100px;
                    transition: background-color 0.3s, color 0.3s;
                }
                .privacy-header {
                    background-color: hsl(var(--muted));
                    padding: 60px 40px;
                    border-bottom: 1px solid hsl(var(--border));
                    transition: background-color 0.3s, border-color 0.3s;
                }
                .privacy-header-inner {
                    max-width: 1000px;
                    margin: 0 auto;
                }
                .privacy-title {
                    font-size: 32px;
                    font-weight: 500;
                    margin: 0;
                    color: hsl(var(--foreground));
                    letter-spacing: -0.02em;
                }
                .privacy-main {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 60px 40px;
                    display: flex;
                    gap: 80px;
                }
                .privacy-sidebar {
                    width: 240px;
                    flex-shrink: 0;
                    position: sticky;
                    top: 100px;
                    align-self: flex-start;
                }
                .nav-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .nav-item {
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
                .nav-item:hover {
                    color: hsl(var(--foreground));
                }
                .nav-item.active {
                    color: hsl(var(--foreground));
                    font-weight: 600;
                }
                .privacy-content {
                    flex: 1;
                }
                .effective-date {
                    font-size: 11px;
                    color: hsl(var(--foreground) / 0.5);
                    margin-bottom: 40px;
                    font-weight: 500;
                }
                .content-section {
                    margin-bottom: 48px;
                }
                .section-title {
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0 0 16px 0;
                    color: hsl(var(--foreground));
                }
                .sub-title {
                    font-size: 14px;
                    font-weight: 600;
                    margin: 24px 0 12px 0;
                    color: hsl(var(--foreground) / 0.9);
                }
                .text-body {
                    font-size: 13px;
                    color: hsl(var(--foreground) / 0.7);
                    line-height: 1.6;
                    margin: 0 0 16px 0;
                }
                .bullet-list {
                    margin: 0 0 16px 0;
                    padding-left: 20px;
                    font-size: 13px;
                    color: hsl(var(--foreground) / 0.7);
                    line-height: 1.6;
                }
                .bullet-list li {
                    margin-bottom: 4px;
                }
                .bullet-list li::marker {
                    color: hsl(var(--foreground) / 0.4);
                }

                @media (max-width: 768px) {
                    .privacy-main {
                        flex-direction: column;
                        gap: 40px;
                    }
                    .privacy-sidebar {
                        width: 100%;
                        position: static;
                    }
                    .nav-list {
                        flex-direction: column;
                        gap: 12px;
                    }
                }
            `}</style>

            {/* Header */}
            <div className="privacy-header">
                <div className="privacy-header-inner">
                    <h1 className="privacy-title">Privacy Policy</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="privacy-main">
                {/* Sidebar */}
                <div className="privacy-sidebar">
                    <div className="nav-list">
                        {sections.map((sec) => (
                            <button 
                                key={sec.id}
                                className={`nav-item ${activeSection === sec.title ? 'active' : ''}`}
                                onClick={() => scrollToSection(sec.id, sec.title)}
                            >
                                {sec.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="privacy-content">
                    <div className="effective-date">Effective Date: July 8, 2025</div>
                    
                    <div id="intro" className="content-section">
                        <h2 className="section-title">1. Introduction</h2>
                        <p className="text-body">
                            At Internia, your privacy matters. This Privacy Policy explains how we collect, use, protect, and share your personal information when you visit or use our internship matching platform. We're committed to keeping your data safe and transparent about how we use it to streamline the university-enterprise workflow.
                        </p>
                    </div>

                    <div id="collect" className="content-section">
                        <h2 className="section-title">2. Information We Collect</h2>
                        <p className="text-body">
                            We collect information in three main ways — when you provide it, when we collect it automatically, and when universities or partner companies help us process your applications.
                        </p>

                        <h3 className="sub-title">a. Personal Information</h3>
                        <p className="text-body">Provided by you at account creation or digital CV completion:</p>
                        <ul className="bullet-list">
                            <li>Full name</li>
                            <li>University email address</li>
                            <li>Phone number</li>
                            <li>Academic records and department details</li>
                            <li>Digital CV details (technical skills, GitHub, portfolio links)</li>
                        </ul>

                        <h3 className="sub-title">b. Device Information</h3>
                        <p className="text-body">Collected automatically when you browse the site:</p>
                        <ul className="bullet-list">
                            <li>IP address</li>
                            <li>Browser type and version</li>
                            <li>Time zone</li>
                            <li>Cookies and device identifiers</li>
                        </ul>

                        <h3 className="sub-title">c. Application Information</h3>
                        <p className="text-body">Generated during the internship matching process:</p>
                        <ul className="bullet-list">
                            <li>Internships applied to and saved</li>
                            <li>Application status and recruiter feedback</li>
                            <li>Generated official documents (Convention de Stage)</li>
                        </ul>
                    </div>

                    <div id="use" className="content-section">
                        <h2 className="section-title">3. How We Use Your Information</h2>
                        <p className="text-body">We use your data to:</p>
                        <ul className="bullet-list">
                            <li>Process and validate your internship applications</li>
                            <li>Automatically generate official university agreements (Convention de Stage)</li>
                            <li>Communicate application updates and interview confirmations</li>
                            <li>Respond to student or company support inquiries</li>
                            <li>Improve platform matching algorithms and user experience</li>
                        </ul>
                    </div>

                    <div id="share" className="content-section">
                        <h2 className="section-title">4. Sharing Your Information</h2>
                        <p className="text-body">We never sell your data. However, we strictly share necessary information with:</p>
                        <ul className="bullet-list">
                            <li><strong>Partner Companies:</strong> Only when you explicitly apply to their internship offers.</li>
                            <li><strong>University Administration:</strong> To validate your internship and generate your official documentation.</li>
                            <li><strong>Regulatory authorities:</strong> When legally required by educational or governmental standards.</li>
                        </ul>
                    </div>

                    <div id="cookies" className="content-section">
                        <h2 className="section-title">5. Cookies & Tracking Technologies</h2>
                        <p className="text-body">
                            Cookies help us remember who you are, personalize your dashboard experience, and analyze site usage to ensure the platform runs smoothly.
                        </p>
                        <p className="text-body">We use cookies to:</p>
                        <ul className="bullet-list">
                            <li>Maintain secure login sessions</li>
                            <li>Remember your language and UI preferences</li>
                            <li>Understand platform traffic and performance</li>
                        </ul>
                    </div>

                    <div id="retention" className="content-section">
                        <h2 className="section-title">6. Data Retention</h2>
                        <p className="text-body">
                            We retain your academic and application data for as long as necessary to fulfill the purposes outlined in this policy, typically for the duration of your academic enrollment, unless a longer retention period is required by university regulations.
                        </p>
                    </div>

                    <div id="contact" className="content-section">
                        <h2 className="section-title">7. Contact Us</h2>
                        <p className="text-body">
                            If you have questions about this Privacy Policy or your data, please contact your university's administration office or email our technical support at <strong>support@internia.com</strong>.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
