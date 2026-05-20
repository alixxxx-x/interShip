import React, { useState, useEffect } from 'react';
import { Phone, Clock, Mail, ArrowUpRight } from 'lucide-react';
import api from "@/api/api";
import { ACCESS_TOKEN } from "@/constants";

export default function ContactUs() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem(ACCESS_TOKEN);
                if (token) {
                    const res = await api.get('/auth/profile/');
                    setEmail(res.data.email);
                    setName(res.data.name || res.data.first_name || "");
                    setIsLoggedIn(true);
                }
            } catch (error) {}
        };
        fetchProfile();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            if (!isLoggedIn) setEmail("");
            setName("");
            setMessage("");
        }, 1000);
    };

    return (
        <div className="contact-container">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&family=Inter:wght@400;500&display=swap');
                
                .contact-container {
                    font-family: 'Outfit', -apple-system, sans-serif;
                    background-color: #ffffff;
                    color: #000000;
                    min-height: 100vh;
                    padding: 80px 40px;
                    box-sizing: border-box;
                    overflow-x: hidden;
                    width: 100%;
                }
                .contact-inner {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .pill-tag {
                    display: inline-block;
                    padding: 6px 14px;
                    border-radius: 99px;
                    border: 1px solid #eaeaea;
                    font-size: 11px;
                    font-weight: 500;
                    letter-spacing: 0.02em;
                    color: #333;
                    margin-bottom: 24px;
                }
                .top-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 40px;
                }
                .h1-contact {
                    font-size: 88px;
                    font-weight: 500;
                    letter-spacing: -0.06em;
                    line-height: 1;
                    margin: 0;
                    color: #111;
                }
                .top-desc {
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    color: #555;
                    text-align: right;
                    line-height: 1.5;
                    max-width: 280px;
                    margin-bottom: 12px;
                }
                .form-card {
                    background-color: #f9f9f9;
                    border-radius: 24px;
                    padding: 24px;
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    gap: 40px;
                }
                .form-content {
                    padding: 16px;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 20px;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .form-label {
                    font-family: 'Inter', sans-serif;
                    font-size: 12px;
                    font-weight: 500;
                    color: #444;
                }
                .form-input {
                    font-family: 'Inter', sans-serif;
                    background-color: #f0f0f0;
                    border: none;
                    border-radius: 6px;
                    padding: 14px 16px;
                    font-size: 13px;
                    color: #111;
                    outline: none;
                    transition: background-color 0.2s;
                }
                .form-input::placeholder {
                    color: #999;
                }
                .form-input:focus {
                    background-color: #e8e8e8;
                }
                .form-textarea {
                    font-family: 'Inter', sans-serif;
                    background-color: #f0f0f0;
                    border: none;
                    border-radius: 6px;
                    padding: 14px 16px;
                    font-size: 13px;
                    color: #111;
                    outline: none;
                    resize: none;
                    height: 100px;
                    width: 100%;
                    box-sizing: border-box;
                }
                .form-textarea::placeholder {
                    color: #999;
                }
                .btn-submit {
                    appearance: none;
                    background-color: #111;
                    color: #fff;
                    border: 0 !important;
                    outline: none !important;
                    box-shadow: none !important;
                    border-radius: 99px;
                    padding: 14px 32px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                .btn-icon {
                    appearance: none;
                    background-color: #111;
                    color: #fff;
                    border: 0 !important;
                    outline: none !important;
                    box-shadow: none !important;
                    border-radius: 50%;
                    width: 44px;
                    height: 44px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    margin-left: 12px;
                }
                .submit-row {
                    display: flex;
                    align-items: center;
                    margin-top: 32px;
                }
                .image-wrapper {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    border-radius: 16px;
                    overflow: hidden;
                    min-height: 400px;
                }
                .image-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .image-tag {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    border: 1px solid rgba(255,255,255,0.4);
                    color: #fff;
                    padding: 6px 16px;
                    border-radius: 99px;
                    font-size: 11px;
                    backdrop-filter: blur(8px);
                }
                .info-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 40px;
                    margin-top: 100px;
                    margin-bottom: 100px;
                }
                .info-block {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }
                .icon-circle {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background-color: #f7f7f7;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                    color: #111;
                }
                .info-title {
                    font-size: 15px;
                    font-weight: 500;
                    margin-bottom: 12px;
                    color: #111;
                }
                .info-text {
                    font-family: 'Inter', sans-serif;
                    font-size: 13px;
                    color: #555;
                    line-height: 1.6;
                }
                .bottom-banner {
                    background-color: #fafafa;
                    border-radius: 24px;
                    padding: 60px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 60px;
                    align-items: center;
                }
                .banner-h2 {
                    font-size: 42px;
                    font-weight: 500;
                    letter-spacing: -0.04em;
                    line-height: 1.1;
                    margin-bottom: 16px;
                    margin-top: 24px;
                    color: #111;
                }
                .banner-p {
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    color: #555;
                    line-height: 1.5;
                    max-width: 300px;
                }
                .banner-images {
                    display: flex;
                    gap: 16px;
                    height: 320px;
                }
                .banner-img {
                    flex: 1;
                    border-radius: 16px;
                    object-fit: cover;
                }

                @media (max-width: 900px) {
                    .form-card, .bottom-banner {
                        grid-template-columns: 1fr;
                    }
                    .image-wrapper {
                        min-height: 300px;
                    }
                    .top-row {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 20px;
                    }
                    .top-desc {
                        text-align: left;
                    }
                    .h1-contact {
                        font-size: 60px;
                    }
                }
            `}</style>

            <div className="contact-inner">
                {/* Top Header */}
                <div className="pill-tag">Get in Touch</div>
                <div className="top-row">
                    <h1 className="h1-contact">Contact Us</h1>
                    <div className="top-desc">
                        Have a question or need support with your internship journey? We're here to help.
                    </div>
                </div>

                {/* Main Form Card */}
                <div className="form-card">
                    <div className="form-content">
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        placeholder="Your full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input 
                                        type="email" 
                                        className="form-input" 
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => !isLoggedIn && setEmail(e.target.value)}
                                        readOnly={isLoggedIn}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <input type="text" className="form-input" placeholder="+213 55 123 4567" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Preferred Date</label>
                                    <input type="text" className="form-input" placeholder="dd/mm/yyyy" />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: "20px" }}>
                                <label className="form-label">Message / Special Requests</label>
                                <textarea 
                                    className="form-textarea" 
                                    placeholder="Anything else we should know?"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="submit-row">
                                <button type="submit" className="btn-submit">Send Message</button>
                                <button type="button" className="btn-icon">
                                    <ArrowUpRight size={20} />
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <div className="image-side">
                        <div className="image-wrapper">
                            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop" alt="Students Working" />
                            <div className="image-tag">Your Career</div>
                        </div>
                    </div>
                </div>

                {/* Icons Section */}
                <div className="info-section">
                    <div className="info-block">
                        <div className="icon-circle">
                            <Phone size={20} strokeWidth={1.5} />
                        </div>
                        <div className="info-title">Call & WhatsApp</div>
                        <div className="info-text">
                            +213 55 123 4567<br />
                            +213 53 987 6543
                        </div>
                    </div>
                    <div className="info-block">
                        <div className="icon-circle">
                            <Clock size={20} strokeWidth={1.5} />
                        </div>
                        <div className="info-title">Working Hours</div>
                        <div className="info-text">
                            Daily: 8am-5pm<br />
                            Friday: Closed
                        </div>
                    </div>
                    <div className="info-block">
                        <div className="icon-circle">
                            <Mail size={20} strokeWidth={1.5} />
                        </div>
                        <div className="info-title">Write to Us</div>
                        <div className="info-text">
                            info@internia.com<br />
                            booking@internia.com
                        </div>
                    </div>
                </div>

                {/* Bottom Banner */}
                <div className="bottom-banner">
                    <div>
                        <div className="pill-tag" style={{ border: "none", backgroundColor: "#f0f0f0", marginBottom: "0" }}>Join Internia</div>
                        <h2 className="banner-h2">Discover your next<br/>perfect career move</h2>
                        <div className="banner-p">
                            Create your profile, apply to top companies, and kickstart your professional journey.
                        </div>
                    </div>
                    <div className="banner-images">
                        <img className="banner-img" src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop" alt="Professional Meeting" />
                    </div>
                </div>
            </div>
        </div>
    );
}
