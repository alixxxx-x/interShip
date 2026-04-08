import { useState, useEffect } from "react";
import api from "@/api/api";
import { useNavigate, Link } from "react-router-dom";
import signUpImg from "@/assets/signUp.png";
import illustrationImg from "@/assets/login-illustration.png";
import logoGif from "@/assets/logo.gif";

/* ─── Carousel slides data ─── */
const slides = [
    {
        image: signUpImg,
        text: <>Find the right internship and build<br />your career with <strong className="text-gray-900">Inter.Ship</strong></>,
    },
    {
        image: illustrationImg,
        text: <>Connect with top companies and<br />unlock your <strong className="text-gray-900">potential</strong></>,
    },
    {
        image: signUpImg,
        text: <>One platform for students, companies,<br />and <strong className="text-gray-900">universities</strong></>,
    },
];

/* ─── Eye Icon ─── */
const EyeIcon = ({ open }) =>
    open ? (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ) : (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);
    const navigate = useNavigate();

    /* Auto-rotate carousel */
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/auth/register/", { username, email, password });
            alert("Registration successful! Please login.");
            navigate("/login");
        } catch (error) {
            alert("Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-white font-['Inter',system-ui,sans-serif]">

            {/* ════════════ LEFT PANEL — Form ════════════ */}
            <div className="flex-1 basis-1/2 flex flex-col justify-center px-16 lg:px-24 py-12 max-w-[680px]">

                {/* Logo */}
                <div className="flex items-center gap-2.5 mb-6">
                    <img src={logoGif} alt="Inter.Ship" className="w-[77px] h-[77px] rounded-lg" />
                    <span className="text-[30px] font-semibold tracking-tight text-gray-900 font-['Poppins',sans-serif]">
                        Inter<span className="text-purple-500">.Ship</span>
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-[2.4rem] font-extrabold text-gray-900 leading-tight tracking-tight mb-2">
                    Create Account!
                </h1>
                <p className="text-[0.95rem] text-gray-400 mb-8 leading-relaxed">
                    Join <strong className="text-gray-600">Inter.Ship</strong> and start your internship journey. Get started for free.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5" id="register-form">

                    {/* Username */}
                    <div>
                        <input
                            id="register-username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            required
                            autoComplete="username"
                            className="w-full px-5 py-3.5 border-[1.5px] border-indigo-100 rounded-xl text-sm text-indigo-950 bg-indigo-50/30 outline-none transition-all placeholder:text-indigo-300 focus:border-purple-600 focus:ring-[3px] focus:ring-purple-600/10 focus:bg-white"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <input
                            id="register-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                            autoComplete="email"
                            className="w-full px-5 py-3.5 border-[1.5px] border-indigo-100 rounded-xl text-sm text-indigo-950 bg-indigo-50/30 outline-none transition-all placeholder:text-indigo-300 focus:border-purple-600 focus:ring-[3px] focus:ring-purple-600/10 focus:bg-white"
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <input
                            id="register-password"
                            type={showPw ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            autoComplete="new-password"
                            className="w-full px-5 py-3.5 pr-12 border-[1.5px] border-indigo-100 rounded-xl text-sm text-indigo-950 bg-indigo-50/30 outline-none transition-all placeholder:text-indigo-300 focus:border-purple-600 focus:ring-[3px] focus:ring-purple-600/10 focus:bg-white"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-indigo-300 hover:text-purple-600 transition-colors p-0 flex items-center"
                            aria-label="Toggle password visibility"
                            tabIndex={-1}
                        >
                            <EyeIcon open={showPw} />
                        </button>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        id="register-submit-btn"
                        disabled={loading}
                        className="w-full py-3.5 text-white text-sm font-semibold rounded-xl border-none cursor-pointer flex items-center justify-center min-h-[48px] transition-all hover:translate-y-[-1px] hover:shadow-[0_6px_22px_rgba(124,58,237,0.35)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{ background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)" }}
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-[2.5px] border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            "Sign Up"
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 whitespace-nowrap tracking-wide">or continue with</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Social Buttons */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        id="register-google-btn"
                        onClick={() => window.location.href = '/auth/google/'}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 border-[1.5px] border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 cursor-pointer transition-all hover:border-purple-300 hover:bg-purple-50/40 hover:shadow-sm active:scale-[0.98]"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-[18px] h-[18px]" />
                        Google
                    </button>

                    <button
                        type="button"
                        id="register-github-btn"
                        onClick={() => window.location.href = '/auth/github/'}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 border-[1.5px] border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 cursor-pointer transition-all hover:border-purple-300 hover:bg-purple-50/40 hover:shadow-sm active:scale-[0.98]"
                    >
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" className="w-[18px] h-[18px]" />
                        GitHub
                    </button>
                </div>

                {/* Login link */}
                <p className="text-center text-sm text-gray-500 mt-8">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-indigo-950 font-bold no-underline hover:text-purple-600 hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </div>

            {/* ════════════ RIGHT PANEL — Carousel ════════════ */}
            <div className="hidden md:flex flex-1 basis-1/2 items-center justify-center bg-[#FDF7FF] relative overflow-hidden p-10">

                {/* Subtle decorative circles */}
                <div className="absolute top-[10%] right-[15%] w-20 h-20 rounded-full bg-gray-200/50 blur-xl" />
                <div className="absolute bottom-[15%] left-[10%] w-32 h-32 rounded-full bg-gray-200/40 blur-2xl" />

                {/* Left arrow */}
                <button
                    onClick={() => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-transparent border-none cursor-pointer text-7xl font-extralight text-gray-300 transition-all hover:text-purple-500 hover:scale-110 active:scale-95 select-none"
                    aria-label="Previous slide"
                >
                    ‹
                </button>

                {/* Right arrow */}
                <button
                    onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-transparent border-none cursor-pointer text-7xl font-extralight text-gray-300 transition-all hover:text-purple-500 hover:scale-110 active:scale-95 select-none"
                    aria-label="Next slide"
                >
                    ›
                </button>

                <div className="flex flex-col items-center gap-8 max-w-[480px] z-10 w-full">

                    {/* Image carousel */}
                    <div className="relative w-full h-[420px] overflow-hidden">
                        {slides.map((slide, i) => (
                            <img
                                key={i}
                                src={slide.image}
                                alt={`Slide ${i + 1}`}
                                className="absolute inset-0 w-full h-full object-contain drop-shadow-sm transition-all duration-700 ease-in-out"
                                style={{
                                    opacity: activeSlide === i ? 1 : 0,
                                    transform: activeSlide === i ? 'translateX(0) scale(1)' : 'translateX(40px) scale(0.95)',
                                    pointerEvents: activeSlide === i ? 'auto' : 'none',
                                }}
                            />
                        ))}
                    </div>

                    {/* Text — changes with slide */}
                    <div className="relative h-16 w-full">
                        {slides.map((slide, i) => (
                            <p
                                key={i}
                                className="absolute inset-0 text-center text-xl font-semibold text-gray-800 leading-relaxed tracking-tight transition-all duration-500"
                                style={{
                                    opacity: activeSlide === i ? 1 : 0,
                                    transform: activeSlide === i ? 'translateY(0)' : 'translateY(10px)',
                                }}
                            >
                                {slide.text}
                            </p>
                        ))}
                    </div>

                    {/* Dots indicator — clickable */}
                    <div className="flex items-center gap-2">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveSlide(i)}
                                className={`rounded-full border-none cursor-pointer transition-all duration-300 ${activeSlide === i
                                    ? 'w-6 h-2 bg-gray-800'
                                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                                    }`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Keyframes */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                #register-form {
                    animation: fadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
            `}</style>
        </div>
    );
}

export default Register;
