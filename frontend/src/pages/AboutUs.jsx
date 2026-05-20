import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import katkoutImg from "@/assets/katkout.jpg";

export default function AboutUs() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const bgColor = "transparent"; 
    const cardBg = isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)"; 
    const txt = isDark ? "#ffffff" : "#1a1a1a";
    const txtLight = isDark ? "#a1a1aa" : "#555";
    const bdr = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";

    return (
        <div style={{ backgroundColor: bgColor, minHeight: "100vh", fontFamily: "'SF Pro Display', 'Inter', -apple-system, sans-serif", color: txt, display: "flex", flexDirection: "column" }}>
            <style>{`
                .editorial-tag {
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    font-weight: 600;
                    margin-bottom: 24px;
                    color: ${txtLight};
                }
                .editorial-h1 {
                    font-size: 52px;
                    font-weight: 400;
                    line-height: 1.1;
                    letter-spacing: -0.03em;
                    margin-bottom: 24px;
                    color: ${txt};
                }
                .editorial-h2 {
                    font-size: 30px;
                    font-weight: 400;
                    letter-spacing: -0.02em;
                    margin-bottom: 12px;
                    color: ${txt};
                }
                .editorial-p {
                    font-size: 13px;
                    line-height: 1.6;
                    color: ${txtLight};
                }
                .container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 0 40px;
                    width: 100%;
                }
                .section {
                    padding: 60px 0;
                }
                .grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 64px;
                }
                .grid-1-2 {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 40px;
                }
                .number-card {
                    background-color: ${cardBg};
                    border-radius: 12px;
                    padding: 32px 24px;
                    display: flex;
                    flex-direction: column;
                    border: 1px solid ${bdr};
                }
                .value-card {
                    background-color: ${cardBg};
                    border-radius: 12px;
                    padding: 32px;
                    margin-bottom: 12px;
                    border: 1px solid ${bdr};
                }
                .huge-text {
                    font-size: 20vw;
                    font-weight: 400;
                    line-height: 0.8;
                    letter-spacing: -0.02em;
                    text-align: center;
                    color: #fff;
                    margin-top: 80px;
                }
                .link-tag {
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    font-weight: 600;
                    text-decoration: none;
                    color: inherit;
                }
                .link-tag:hover {
                    text-decoration: underline;
                }
            `}</style>

            {/* Navbar spacer */}
            <div style={{ height: 140 }}></div>

            <div className="container">
                {/* HERO */}
                <div className="section grid-2" style={{ alignItems: "center", paddingBottom: "100px" }}>
                    <div>
                        <div className="editorial-tag">✦ ABOUT</div>
                        <h1 className="editorial-h1">
                            Empowering the next<br />
                            — generation of<br />
                            professionals.
                        </h1>
                        <p className="editorial-p">
                            Crafting seamless internship matching experiences for students and companies.
                        </p>
                    </div>
                    <div>
                        <img 
                            src={katkoutImg} 
                            alt="Katkout"
                            style={{ width: "100%", borderRadius: "20px", aspectRatio: "4/5", objectFit: "cover" }}
                        />
                    </div>
                </div>

                {/* BY THE NUMBERS */}
                <div className="section">
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
                        <div className="editorial-tag">✦ BY THE NUMBERS</div>
                        <a href="/internships" className="link-tag">EXPLORE ROLES ↗</a>
                    </div>
                    
                    <div style={{ textAlign: "center", marginBottom: "64px" }}>
                        <h2 className="editorial-h2">By The Numbers</h2>
                        <p className="editorial-p">A few things we're proud of — and our growing community.</p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                        <div className="number-card">
                            <div style={{ fontSize: "36px", fontWeight: "400", marginBottom: "16px", color: txt }}>250+</div>
                            <div className="editorial-tag" style={{ marginBottom: "16px" }}>ACTIVE INTERNSHIPS</div>
                            <p className="editorial-p">From tech to finance, we offer a wide range of opportunities to kickstart your career.</p>
                        </div>
                        <div className="number-card">
                            <div style={{ fontSize: "36px", fontWeight: "400", marginBottom: "16px", color: txt }}>15k+</div>
                            <div className="editorial-tag" style={{ marginBottom: "16px" }}>VERIFIED STUDENTS</div>
                            <p className="editorial-p">A growing community of ambitious learners ready to make an impact in the professional world.</p>
                        </div>
                        <div className="number-card">
                            <div style={{ fontSize: "36px", fontWeight: "400", marginBottom: "16px", color: txt }}>100+</div>
                            <div className="editorial-tag" style={{ marginBottom: "16px" }}>PARTNER COMPANIES</div>
                            <p className="editorial-p">Collaborating with industry leaders who trust us to find their next top talent.</p>
                        </div>
                        <div className="number-card">
                            <div style={{ fontSize: "36px", fontWeight: "400", marginBottom: "16px", color: txt }}>92%</div>
                            <div className="editorial-tag" style={{ marginBottom: "16px" }}>MATCH RATE</div>
                            <p className="editorial-p">High placement success driven by our dedicated support and intelligent matching algorithms.</p>
                        </div>
                    </div>
                </div>

                {/* VALUES */}
                <div className="section grid-1-2" style={{ paddingTop: "80px" }}>
                    <div>
                        <div className="editorial-tag">✦ VALUES</div>
                        <h2 className="editorial-h2">Values</h2>
                    </div>
                    <div>
                        <div className="value-card">
                            <div className="editorial-tag" style={{ marginBottom: "12px" }}>ACCESSIBILITY OVER EXCLUSIVITY</div>
                            <p className="editorial-p" style={{ margin: 0 }}>We believe every student deserves a fair chance to shine. Opportunity should be open and accessible to all.</p>
                        </div>
                        <div className="value-card">
                            <div className="editorial-tag" style={{ marginBottom: "12px" }}>INNOVATION IN HIRING</div>
                            <p className="editorial-p" style={{ margin: 0 }}>We rethink the traditional application process, making it faster, smarter, and more transparent for everyone involved.</p>
                        </div>
                        <div className="value-card">
                            <div className="editorial-tag" style={{ marginBottom: "12px" }}>DRIVEN BY GROWTH</div>
                            <p className="editorial-p" style={{ margin: 0 }}>It's not just about filling open roles. It's about fostering long-term career development and mutual success.</p>
                        </div>
                    </div>
                </div>

                {/* WHAT I DO */}
                <div className="section grid-1-2" style={{ paddingTop: "80px" }}>
                    <div>
                        <div className="editorial-tag">✦ WHAT WE DO</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "0 20px" }}>
                        <h2 className="editorial-h2" style={{ marginBottom: "24px" }}>A Platform That Balances<br/>Opportunity And Ambition</h2>
                        <p className="editorial-p">
                            We specialize in connecting students with meaningful internships — working closely with universities and partner companies to shape careers that last. Whether you're landing your first role or seeking fresh talent, we bring structure, intention, and seamless matching to the table.
                        </p>
                    </div>
                </div>

                {/* SERVICES */}
                <div className="section grid-1-2" style={{ paddingTop: "80px" }}>
                    <div>
                        <div className="editorial-tag">✦ PLATFORM</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
                        <div className="editorial-tag" style={{ margin: 0 }}>⊚ Student Profiles & Portfolios</div>
                        <div className="editorial-tag" style={{ margin: 0 }}>⊚ Intelligent Internship Matching</div>
                        <div className="editorial-tag" style={{ margin: 0 }}>⊚ Direct Company Applications</div>
                        <a href="/internships" className="link-tag" style={{ marginTop: "16px" }}>VIEW INTERNSHIPS ↗</a>
                    </div>
                </div>

                {/* GET IN TOUCH */}
                <div className="section" style={{ paddingTop: "80px", paddingBottom: "120px" }}>
                    <div className="editorial-tag">✦ JOIN THE NETWORK</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "40px" }}>
                        <h1 className="editorial-h1" style={{ margin: 0 }}>Ready To Start?</h1>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", paddingBottom: "12px" }}>
                            <div style={{ width: "8px", height: "8px", backgroundColor: "transparent", border: `1.5px solid ${txt}`, borderRadius: "2px" }}></div>
                            <div style={{ width: "8px", height: "8px", backgroundColor: "transparent", border: `1.5px solid ${txt}`, borderRadius: "2px" }}></div>
                            <div style={{ width: "8px", height: "8px", backgroundColor: "transparent", border: `1.5px solid ${txt}`, borderRadius: "2px" }}></div>
                            <div style={{ width: "8px", height: "8px", backgroundColor: "transparent", border: `1.5px solid ${txt}`, borderRadius: "2px" }}></div>
                        </div>
                    </div>
                    <div style={{ marginTop: "100px" }}>
                        <a href="/register" className="link-tag">SIGN UP NOW ↗</a>
                    </div>
                </div>
            </div>

        </div>
    );
}

