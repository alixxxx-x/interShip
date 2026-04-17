import { Link } from "react-router-dom";
import logoGif from "@/assets/logo.gif";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-sm">
                    <div className="space-y-4">
                        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <img src={logoGif} alt="Inter.Ship" className="w-8 h-8 rounded-md" />
                            <span className="text-xl font-bold tracking-tight text-purple-600 font-['Poppins',sans-serif]">
                                Inter<span className="text-purple-400">.Ship</span>
                            </span>
                        </Link>
                        <p className="leading-relaxed text-gray-400">
                            Connecting students with top companies for smarter internships. We streamline the matching and validation process for everyone.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold uppercase tracking-wider mb-6 text-xs">Explore</h3>
                        <ul className="space-y-3 text-gray-400">
                            <li><Link to="/internships" className="hover:text-cyan-400 transition-colors">Browse Internships</Link></li>
                            <li><Link to="/companies" className="hover:text-cyan-400 transition-colors">Companies</Link></li>
                            <li>
                                <Link to="/#how-it-works"
                                    onClick={(e) => {
                                        if (window.location.pathname === '/') {
                                            e.preventDefault();
                                            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    className="hover:text-cyan-400 transition-colors"
                                >
                                    How it Works
                                </Link>
                            </li>
                            <li><Link to="/register" className="hover:text-cyan-400 transition-colors">Join Now</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold uppercase tracking-wider mb-6 text-xs">Resources</h3>
                        <ul className="space-y-3 text-gray-400">
                            <li><Link to="/guidelines" className="hover:text-cyan-400 transition-colors">Student Guidelines</Link></li>
                            <li><Link to="/faq" className="hover:text-cyan-400 transition-colors">FAQs</Link></li>
                            <li><Link to="/support" className="hover:text-cyan-400 transition-colors">Support Center</Link></li>
                            <li><Link to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold uppercase tracking-wider mb-6 text-xs">Contact Us</h3>
                        <ul className="space-y-3 text-gray-400">
                            <li>Email: <a href="mailto:support@intership.com" className="hover:text-cyan-400 transition-colors">support@intership.com</a></li>
                            <li>Phone: <span>+213 123 456 789</span></li>
                            <li>Address: <span>Algiers, Algeria</span></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
                    <p>© 2026 Inter.Ship Platform. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
