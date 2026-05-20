import React, { useState } from 'react';

export default function PricingPolicy() {
    const [activeSection, setActiveSection] = useState("Overview");

    const sections = [
        { id: "overview", title: "1. Overview" },
        { id: "candidates", title: "2. Student & University Access" },
        { id: "recruiters", title: "3. Recruiter Subscriptions" },
        { id: "payments", title: "4. Payments & Invoicing" },
        { id: "refunds", title: "5. Cancellations & Refunds" },
        { id: "security", title: "6. Security & Compliance" },
        { id: "contact", title: "7. Contact Billing" }
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
        <div className="pricing-policy-page">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
                
                .pricing-policy-page {
                    font-family: 'Inter', -apple-system, sans-serif;
                    background-color: hsl(var(--background));
                    color: hsl(var(--foreground));
                    min-height: 100vh;
                    padding-bottom: 100px;
                    transition: background-color 0.3s, color 0.3s;
                }
                .policy-header {
                    background-color: hsl(var(--muted));
                    padding: 60px 40px;
                    border-bottom: 1px solid hsl(var(--border));
                    transition: background-color 0.3s, border-color 0.3s;
                }
                .policy-header-inner {
                    max-width: 1000px;
                    margin: 0 auto;
                }
                .policy-title {
                    font-size: 32px;
                    font-weight: 500;
                    margin: 0;
                    color: hsl(var(--foreground));
                    letter-spacing: -0.02em;
                }
                .policy-main {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 60px 40px;
                    display: flex;
                    gap: 80px;
                }
                .policy-sidebar {
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
                .policy-content {
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
                    .policy-main {
                        flex-direction: column;
                        gap: 40px;
                    }
                    .policy-sidebar {
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
            <div className="policy-header">
                <div className="policy-header-inner">
                    <h1 className="policy-title">Pricing Policy</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="policy-main">
                {/* Sidebar */}
                <div className="policy-sidebar">
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
                <div className="policy-content">
                    <div className="effective-date">Last Updated: September 2025</div>
                    
                    <div className="content-section">
                        <p className="text-body">
                            Internia is committed to offering a transparent, high-value, and reliable pricing system for students, universities, and enterprise recruiters. This Pricing Policy details our billing processes, subscription structures, digital invoice terms, and cancellations.
                        </p>
                    </div>

                    <div id="overview" className="content-section">
                        <h2 className="section-title">1. Overview</h2>
                        <p className="text-body">
                            Our primary mission is to democratize high-quality internship placements. By ensuring that students never pay for internship hunting and universities have absolute free management tooling, we maintain an open, merit-based ecosystem funded through corporate recruitment and listing enhancements.
                        </p>
                    </div>

                    <div id="candidates" className="content-section">
                        <h2 className="section-title">2. Student & University Access</h2>
                        <ul className="bullet-list">
                            <li><strong>100% Free for Students:</strong> Accessing matches, building editorial CV profiles, applying to placements, and signing generated agreements is completely free. Internia will never charge candidates or academic institutions for placing students.</li>
                            <li><strong>Free University Portal:</strong> University coordinators can verify student profiles, track agreements, and approve placements without administrative fees.</li>
                        </ul>
                    </div>

                    <div id="recruiters" className="content-section">
                        <h2 className="section-title">3. Recruiter Subscriptions</h2>
                        <p className="text-body">
                            Partner companies can opt for dynamic recruitment tiers depending on their intake requirements:
                        </p>
                        <ul className="bullet-list">
                            <li><strong>Starter Plan (Free):</strong> Post up to 2 active internship offers, receive basic digital CV applications, and generate standard agreements.</li>
                            <li><strong>Premium Recruitment:</strong> Unlimited active offers, advanced matching algorithms, pipeline analytics dashboards, and digital signing flow.</li>
                            <li><strong>Enterprise Solutions:</strong> Bespoke custom integrations, multi-university partnerships, dedicated recruiter accounts, and priority student recommendations.</li>
                        </ul>
                    </div>

                    <div id="payments" className="content-section">
                        <h2 className="section-title">4. Payments & Invoicing</h2>
                        <ul className="bullet-list">
                            <li>All corporate billing transactions are processed securely through certified payment gateways.</li>
                            <li>Invoices are automatically generated and sent to the billing contact email registered on your workspace.</li>
                            <li>Standard payment cycles are either monthly or annually, billed in advance. Overdue balances may result in temporary recruitment dashboard restrictions.</li>
                        </ul>
                    </div>

                    <div id="refunds" className="content-section">
                        <h2 className="section-title">5. Cancellations & Refunds</h2>
                        <ul className="bullet-list">
                            <li><strong>Subscription Cancellations:</strong> You can cancel your paid corporate recruiter plan at any time through your dashboard settings. Upon cancellation, your workspace remains fully active until the end of the current billing period.</li>
                            <li><strong>Refund Eligibility:</strong> Paid corporate subscription fees are generally non-refundable. However, if platform service levels fail due to confirmed technical downtime, contact our billing department within 7 days for a proportional refund evaluation.</li>
                        </ul>
                    </div>

                    <div id="security" className="content-section">
                        <h2 className="section-title">6. Security & Compliance</h2>
                        <p className="text-body">
                            We take payment security seriously. Internia does not store direct credit card or banking credentials. All digital payments adhere to strict industry encryption benchmarks, ensuring a secure transactional interface for our corporate partners.
                        </p>
                    </div>

                    <div id="contact" className="content-section">
                        <h2 className="section-title">7. Contact Billing</h2>
                        <p className="text-body">
                            If you have any inquiries regarding invoices, custom corporate plans, or payment methods, please reach out to our billing desk:
                        </p>
                        <ul className="bullet-list">
                            <li>Billing Inquiry Email: <strong>billing@internia.com</strong></li>
                            <li>Corporate Support Helpline: <strong>+213 123 456 789</strong></li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
}
