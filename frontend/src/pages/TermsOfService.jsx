import React, { useState } from 'react';

export default function TermsOfService() {
    const [activeSection, setActiveSection] = useState("Acceptance of Terms");

    const sections = [
        { id: "acceptance", title: "1. Acceptance of Terms" },
        { id: "services", title: "2. Services Provided" },
        { id: "usage", title: "3. Use of Website & Content" },
        { id: "responsibilities", title: "4. User Responsibilities" },
        { id: "fees", title: "5. Platform Fees & Billing" },
        { id: "liability", title: "6. Limitation of Liability" },
        { id: "governing", title: "7. Governing Law" },
        { id: "contact", title: "8. Contact Us" }
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
        <div className="terms-page">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
                
                .terms-page {
                    font-family: 'Inter', -apple-system, sans-serif;
                    background-color: hsl(var(--background));
                    color: hsl(var(--foreground));
                    min-height: 100vh;
                    padding-bottom: 100px;
                    transition: background-color 0.3s, color 0.3s;
                }
                .terms-header {
                    background-color: hsl(var(--muted));
                    padding: 60px 40px;
                    border-bottom: 1px solid hsl(var(--border));
                    transition: background-color 0.3s, border-color 0.3s;
                }
                .terms-header-inner {
                    max-width: 1000px;
                    margin: 0 auto;
                }
                .terms-title {
                    font-size: 32px;
                    font-weight: 500;
                    margin: 0;
                    color: hsl(var(--foreground));
                    letter-spacing: -0.02em;
                }
                .terms-main {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 60px 40px;
                    display: flex;
                    gap: 80px;
                }
                .terms-sidebar {
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
                .terms-content {
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
                    margin-bottom: 6px;
                }
                .bullet-list li::marker {
                    color: hsl(var(--foreground) / 0.4);
                }

                @media (max-width: 768px) {
                    .terms-main {
                        flex-direction: column;
                        gap: 40px;
                    }
                    .terms-sidebar {
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
            <div className="terms-header">
                <div className="terms-header-inner">
                    <h1 className="terms-title">Terms of Service</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="terms-main">
                {/* Sidebar */}
                <div className="terms-sidebar">
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
                <div className="terms-content">
                    <div className="effective-date">Last Updated: September 2025</div>
                    
                    <div className="content-section">
                        <p className="text-body">
                            Welcome to Internia. These Terms of Service ("Terms") govern your access to and use of our university-enterprise internship management platform, including any website content, features, and document generation tools. By engaging with Internia, you agree to these Terms. Please read them carefully. If you do not agree, you should not use our platform or digital services.
                        </p>
                    </div>

                    <div id="acceptance" className="content-section">
                        <h2 className="section-title">1. Acceptance of Terms</h2>
                        <p className="text-body">
                            By accessing our website, registering a student or corporate account, or entering into an internship agreement generated through the platform, you acknowledge that you have read, understood, and agreed to these Terms, as well as our <a href="/privacy" style={{ color: 'hsl(var(--foreground))', fontWeight: 600, textDecoration: 'underline' }}>Privacy Policy</a>.
                        </p>
                    </div>

                    <div id="services" className="content-section">
                        <h2 className="section-title">2. Services Provided</h2>
                        <p className="text-body">
                            Internia provides a professional, digital internship matching and administrative validation platform. Our services include, but are not limited to:
                        </p>
                        <ul className="bullet-list">
                            <li>Student digital CV building and academic profile hosting</li>
                            <li>Corporate recruiter workspace for internship offer posting and pipeline recruitment tracking</li>
                            <li>Smart matching assistance between candidates and active placement offers</li>
                            <li>Automated pre-generation of official university internship agreements (Convention de Stage)</li>
                            <li>Digitized review, messaging, and validation flows for university administrators, students, and companies</li>
                        </ul>
                    </div>

                    <div id="usage" className="content-section">
                        <h2 className="section-title">3. Use of Website & Content</h2>
                        <ul className="bullet-list">
                            <li>All software code, user interface designs, dynamic animations, logos, and graphics on this platform are owned by or licensed to Internia.</li>
                            <li>You may view and utilize the platform assets solely for your personal academic search or official corporate recruitment purposes. You may not reproduce, distribute, modify, or commercially exploit any part of our platform without explicit written consent.</li>
                            <li>Any unauthorized scraping, abuse of the notification system, or automated data extraction will result in immediate account termination and potential legal action.</li>
                        </ul>
                    </div>

                    <div id="responsibilities" className="content-section">
                        <h2 className="section-title">4. User Responsibilities</h2>
                        <p className="text-body">When engaging with our platform, all users agree to:</p>
                        <ul className="bullet-list">
                            <li>Provide 100% accurate and authentic educational background, university records, and corporate listing details.</li>
                            <li>Ensure that any text, documents, credentials, or digital assets uploaded do not infringe upon third-party intellectual property or privacy rights.</li>
                            <li>Review, sign, and process generated digital agreements (Convention de Stage) in a professional and timely manner.</li>
                            <li>Maintain clean and professional communication throughout matching, interview scheduling, and placement tracking.</li>
                        </ul>
                    </div>

                    <div id="fees" className="content-section">
                        <h2 className="section-title">5. Platform Fees & Billing</h2>
                        <ul className="bullet-list">
                            <li><strong>Students & Universities:</strong> Platform registration, digital CV building, application tracking, and automated agreement generation are completely free of charge for students and authorized educational partners.</li>
                            <li><strong>Companies:</strong> Professional posting tiers, advanced recruitment filters, and specific dashboard metrics may be subject to transparent corporate subscription fees. Any standard billing terms will be explicitly outlined in individual service level proposals.</li>
                        </ul>
                    </div>

                    <div id="liability" className="content-section">
                        <h2 className="section-title">6. Limitation of Liability</h2>
                        <p className="text-body">
                            Internia operates solely as a matching and workflow facilitation platform. While we take extreme measures to verify academic and corporate partner credentials, we are not responsible or liable for actual workplace disputes, recruitment decisions, or the physical execution of any student internship.
                        </p>
                    </div>

                    <div id="governing" className="content-section">
                        <h2 className="section-title">7. Governing Law</h2>
                        <p className="text-body">
                            These Terms are governed by and construed in accordance with the regulations of the Ministry of Higher Education and Scientific Research, alongside Algerian digital commerce and civil laws. Any legal disputes will be handled within Algerian jurisdictions.
                        </p>
                    </div>

                    <div id="contact" className="content-section">
                        <h2 className="section-title">8. Contact Us</h2>
                        <p className="text-body">
                            For any inquiries regarding these Terms of Service or to report platform violations, please reach out to:
                        </p>
                        <ul className="bullet-list">
                            <li>Email: <strong>support@internia.com</strong></li>
                            <li>Phone: <strong>+213 123 456 789</strong></li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
}
