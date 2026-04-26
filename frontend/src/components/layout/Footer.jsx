import { Link } from "react-router-dom";
import logoGif from "@/assets/logo.gif";
import { useEffect, useState } from "react";
import api from "@/api/api";
import { ACCESS_TOKEN } from "@/constants";

export default function Footer() {
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem(ACCESS_TOKEN);
                if (token) {
                    const res = await api.get('/auth/profile/');
                    setUserInfo(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch profile in Footer:", error);
            }
        };
        fetchProfile();
    }, []);

    return (
        <footer className="bg-background text-foreground py-12 md:py-16 border-t">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-sm">
                    <div className="space-y-4">
                        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <img src={logoGif} alt="Inter.Ship" className="w-8 h-8 rounded-md" />
                            <span className="text-xl font-bold tracking-tight text-purple-600 font-['Poppins',sans-serif]">
                                Inter<span className="text-purple-400">.Ship</span>
                            </span>
                        </Link>
                        <p className="leading-relaxed text-muted-foreground">
                            Connecting students with top companies for smarter internships. We streamline the matching and validation process for everyone.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold uppercase tracking-wider mb-6 text-xs text-foreground">Explore</h3>
                        <ul className="space-y-3 text-muted-foreground">
                            <li><Link to="/internships" className="hover:text-primary transition-colors">Browse Internships</Link></li>
                            <li><Link to="/companies" className="hover:text-primary transition-colors">Companies</Link></li>
                            <li>
                                <Link to="/#how-it-works"
                                    onClick={(e) => {
                                        if (window.location.pathname === '/') {
                                            e.preventDefault();
                                            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    className="hover:text-primary transition-colors"
                                >
                                    How it Works
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to={userInfo ? "#" : "/register"} 
                                    onClick={(e) => userInfo && e.preventDefault()}
                                    className={`transition-colors ${
                                        userInfo 
                                        ? "text-gray-500 cursor-not-allowed hover:text-gray-500" 
                                        : "text-slate-500 hover:text-cyan-500 font-semibold"
                                    }`}
                                >
                                    Join Now
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold uppercase tracking-wider mb-6 text-xs text-foreground">Resources</h3>
                        <ul className="space-y-3 text-muted-foreground">
                            <li><Link to="/guidelines" className="hover:text-primary transition-colors">Student Guidelines</Link></li>
                            <li><Link to="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
                            <li><Link to="/support" className="hover:text-primary transition-colors">Support Center</Link></li>
                            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold uppercase tracking-wider mb-6 text-xs text-foreground">Contact Us</h3>
                        <ul className="space-y-3 text-muted-foreground">
                            <li>Email: <a href="mailto:support@intership.com" className="hover:text-primary transition-colors">support@intership.com</a></li>
                            <li>Phone: <span>+213 123 456 789</span></li>
                            <li>Address: <span>Algiers, Algeria</span></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t text-center text-xs text-muted-foreground">
                    <p>© 2026 Inter.Ship Platform. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
