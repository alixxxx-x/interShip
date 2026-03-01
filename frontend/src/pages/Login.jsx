import { useState } from "react";
import api from "../services/api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { useNavigate, Link } from "react-router-dom";
import illustrationImg from "../assets/login-illustration.png";
import logoGif from "../assets/logo.gif";
import bgTexture from "../assets/backgroundLogin.jpg";

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

/* ─── Stars ─── */
const Stars = () => (
    <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
            <svg key={i} width="16" height="16" fill="#FBBF24" viewBox="0 0 24 24">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
        ))}
    </div>
);

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/auth/login/", { username, password });
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
            navigate("/");
        } catch (error) {
            alert("Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden font-['Inter',system-ui,sans-serif]">

            {/* ════════════ LEFT PANEL ════════════ */}
            <div className="relative flex-1 basis-1/2 min-w-0 overflow-hidden">

                {/*  Base gradient */}
                <div
                    className="absolute inset-0 z-0"
                    style={{ background: "linear-gradient(155deg, #080086 0%, #7C3AED 50%, #A855F7 100%)" }}
                />

                {/*  Texture image */}
                <div
                    className="absolute inset-0 z-[1] bg-cover bg-center bg-no-repeat opacity-30"
                    style={{ backgroundImage: `url(${bgTexture})` }}
                />

                {/*  Gradient overlay */}
                <div
                    className="absolute inset-0 z-[2] opacity-20"
                    style={{ background: "linear-gradient(155deg, #080086 0%, #7C3AED 50%, #A855F7 100%)" }}
                />

                {/* Decorative glow ellipse */}
                <div
                    className="absolute z-[2] pointer-events-none rounded-full"
                    style={{
                        width: "360px",
                        height: "784px",
                        right: "-80px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "#D469FF",
                        opacity: 0.8,
                        filter: "blur(120px)",
                    }}
                />


                {/* Decorative blue ellipse (from Figma) */}
                <div className="absolute z-[2] pointer-events-none rounded-full w-[500px] h-[400px] left-1/2 bottom-[10%] -translate-x-[30%] bg-[#dbc8ffff] opacity-60 blur-[50px]" />

                {/* Content */}
                <div className="relative z-[3] flex flex-col h-full px-10 py-8 text-white">

                    {/* Logo */}
                    <div className="flex items-center gap-2 shrink-0">
                        <img src={logoGif} alt="stage.io" className="w-[77px] h-[77px] rounded-lg" />
                        <span className="text-[30px] font-semibold tracking-tight text-[#F1F1F1] font-['Poppins',sans-serif]">
                            Inter<span className="text-purple-300">.Ship</span>
                        </span>
                    </div>

                    {/* Headline */}
                    <div className="mt-4 shrink-0">
                        <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-white font-['Poppins',sans-serif]">
                            Connecting Students<br />
                            and Companies for Smarter<br />
                            Internships
                        </h1>
                        <p className="mt-2 ml-20 text-[16px] text-white font-normal font-['Port_Lligat_Slab',serif]">
                            University–Enterprise Internship Management Platform
                        </p>
                    </div>

                    {/* Illustration */}
                    <div className="flex-1 flex items-center justify-end min-h-0 py-2  ">
                        <img
                            src={illustrationImg}
                            alt="Collaboration"
                            className="max-w-[90%] max-h-full object-contain drop-shadow-lg"
                        />
                    </div>

                    {/* Testimonial */}
                    <div className="shrink-0 relative p-[1px] rounded-3xl max-w-[480px] mx-auto" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05))' }}>
                        <div className="bg-white/[0.08] backdrop-blur-2xl rounded-3xl px-7 py-6 flex flex-col gap-3 relative overflow-hidden">
                            {/* Decorative glow */}
                            <div className="absolute -top-8 -right-8 w-28 h-28 bg-purple-300/15 rounded-full blur-2xl pointer-events-none" />

                            <div className="flex items-center justify-between">
                                <Stars />
                                {/* Quote mark */}
                                <span className="text-3xl font-serif text-white/15 leading-none select-none">❝</span>
                            </div>

                            <p className="text-[0.88rem] leading-relaxed text-white/90 tracking-wide">
                                <strong className="text-white font-semibold">Inter.Ship</strong> simplifies internship matching between
                                students and companies while automating administrative validation
                                and document generation.
                            </p>

                            <div className="flex items-center gap-3 pt-1 border-t border-white/10">
                                <div className="w-1 h-4 rounded-full bg-purple-400/50" />
                                <p className="text-[0.8rem] italic text-purple-200/60 tracking-wide">
                                    One platform. Three spaces. Seamless coordination.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ════════════ RIGHT PANEL ════════════ */}
            <div className="flex-none basis-1/2 flex items-center justify-center bg-[#edecf6] p-8">

                <div className="bg-white rounded-3xl px-9 py-9 w-full  h-[600px] max-w-[450px] shadow-[0_4px_30px_rgba(124,58,237,0.07),0_1px_3px_rgba(0,0,0,0.04)] animate-[slideUp_0.5s_cubic-bezier(0.22,1,0.36,1)_forwards]">

                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <img src={logoGif} alt="stage.io" className="w-8 h-8 rounded-md" />
                        <span className="text-lg font-bold tracking-tight text-purple-600">
                            Inter<span className="text-purple-400">.Ship</span>
                        </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-center text-xl font-bold text-indigo-950 mb-6 ">
                        Welcome Back!
                    </h2>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4" id="login-form">

                        {/* Email */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="login-email" className="text-xs font-semibold text-indigo-900">
                                Email
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Email"
                                required
                                autoComplete="email"
                                className="w-full px-3.5 py-2.5 border-[1.5px] border-indigo-100 rounded-xl text-sm font-[inherit] text-indigo-950 bg-indigo-50/30 outline-none transition-all placeholder:text-indigo-300 focus:border-purple-600 focus:ring-[3px] focus:ring-purple-600/10 focus:bg-white"
                            />
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="login-password" className="text-xs font-semibold text-indigo-900">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPw ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    required
                                    autoComplete="current-password"
                                    className="w-full px-3.5 py-2.5 pr-10 border-[1.5px] border-indigo-100 rounded-xl text-sm font-[inherit] text-indigo-950 bg-indigo-50/30 outline-none transition-all placeholder:text-indigo-300 focus:border-purple-600 focus:ring-[3px] focus:ring-purple-600/10 focus:bg-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(!showPw)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-indigo-300 hover:text-purple-600 transition-colors p-0 flex items-center"
                                    aria-label="Toggle password visibility"
                                    tabIndex={-1}
                                >
                                    <EyeIcon open={showPw} />
                                </button>
                            </div>
                            <div className="text-right mt-0.5">
                                <Link
                                    to="/forgot-password"
                                    className="text-xs font-medium text-purple-600 no-underline hover:text-purple-800 hover:underline"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            id="login-submit-btn"
                            disabled={loading}
                            className="mt-1 w-full py-3 border-none rounded-xl text-sm font-semibold text-white cursor-pointer flex items-center justify-center min-h-[44px] transition-all hover:translate-y-[-1px] hover:shadow-[0_6px_22px_rgba(124,58,237,0.35)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                            style={{ background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)" }}
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-[2.5px] border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                "Sign In"
                            )}
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-1">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-xs text-gray-400 whitespace-nowrap">or continue with</span>
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        {/* OAuth Buttons ( gogle and gitub ) */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                id="login-google-btn"
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 border-[1.5px] border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 cursor-pointer transition-all hover:border-purple-300 hover:bg-purple-50/40 hover:shadow-sm active:scale-[0.98]"
                                onClick={() => window.location.href = '/auth/google/'}
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-[18px] h-[18px]" />
                                Google
                            </button>

                            <button
                                type="button"
                                id="login-github-btn"
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 border-[1.5px] border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 cursor-pointer transition-all hover:border-purple-300 hover:bg-purple-50/40 hover:shadow-sm active:scale-[0.98]"
                                onClick={() => window.location.href = '/auth/github/'}
                            >
                                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" className="w-[18px] h-[18px]" />
                                GitHub
                            </button>
                        </div>

                        {/* signup link */}
                        <p className="text-center text-sm text-gray-500 mt-2">
                            Don't have an account?{" "}
                            <Link
                                to="/register"
                                className="text-indigo-950 font-bold no-underline hover:text-purple-600 hover:underline"
                            >
                                Sign up
                            </Link>
                        </p>
                    </form>
                </div>
            </div>

            {/* Keyframes */}
            <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}

export default Login;
