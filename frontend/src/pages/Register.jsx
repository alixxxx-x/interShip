import { useState, useEffect } from "react";
import api from "@/api/api";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import signUpImg from "@/assets/signUp.png";
import illustrationImg from "@/assets/login-illustration.png";
import headerImg from "@/assets/HEADER.png";
import logoGif from "@/assets/logo.gif";

/* ─── Carousel slides data ─── */
const slides = [
    {
        image: illustrationImg,
        text: <>Connect with top companies and<br />unlock your <strong className="text-gray-900">potential</strong></>,
    },
    {
        image: signUpImg,
        text: <>Find the right internship and build<br />your career with <strong className="text-gray-900">Inter.Ship</strong></>,
    },
    {
        image: headerImg,
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

/* ─── Student Icon ─── */
const StudentIcon = ({ active }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#7c3aed" : "#9ca3af"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5" />
    </svg>
);

/* ─── Company Icon ─── */
const CompanyIcon = ({ active }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#7c3aed" : "#9ca3af"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
        <path d="M12 12h.01" />
        <path d="M2 12h20" />
    </svg>
);

function Register() {
    const [searchParams] = useSearchParams();
    const initialRole = searchParams.get("type") === "company" ? "company" : "student";
    const [role, setRole] = useState(initialRole);
    /* Student fields */
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    /* Company fields */
    const [companyName, setCompanyName] = useState("");
    /* Common fields */
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [activeSlide, setActiveSlide] = useState(0);
    const navigate = useNavigate();

    /* Auto-rotate carousel */
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    /* Reset fields when role changes */
    const handleRoleChange = (newRole) => {
        setRole(newRole);
        setFirstName("");
        setLastName("");
        setCompanyName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let formErrors = {};

        if (role === "student") {
            if (!firstName.trim()) formErrors.firstName = "First name is required.";
            if (!lastName.trim()) formErrors.lastName = "Last name is required.";
        } else {
            if (!companyName.trim()) formErrors.companyName = "Company name is required.";
        }
        if (!email.trim()) formErrors.email = "Email is required.";
        if (!password) formErrors.password = "Password is required.";
        if (!confirmPassword) formErrors.confirmPassword = "Please confirm your password.";
        if (password && confirmPassword && password !== confirmPassword) {
            formErrors.confirmPassword = "Passwords do not match.";
        }

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setErrors({});
        setLoading(true);
        try {
            const payload = role === "student"
                ? { first_name: firstName, last_name: lastName, email, password, role: "STUDENT" }
                : { name: companyName, email, password, role: "COMPANY" };

            await api.post("/auth/register/", payload);
            alert("Registration successful! Please login.");
            navigate("/login");
        } catch (error) {
            alert("Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (field) =>
        `w-full px-5 py-3.5 border-[1.5px] rounded-xl text-sm text-indigo-950 dark:text-gray-100 bg-indigo-50/30 dark:bg-gray-800/50 outline-none transition-all placeholder:text-indigo-300 dark:placeholder:text-gray-500 focus:ring-[3px] ${errors[field] ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20' : 'border-indigo-100 dark:border-gray-700 focus:border-purple-600 dark:focus:border-purple-500 focus:ring-purple-600/10'}`;

    const errorMsg = (field) =>
        errors[field] ? (
            <span className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1">
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors[field]}
            </span>
        ) : null;

    return (
        <div className="flex min-h-screen bg-white dark:bg-gray-900 font-['Inter',system-ui,sans-serif]">

            {/* ====== LEFT PANEL — Form ======= */}
            <div className="flex-1 basis-1/2 flex flex-col justify-center px-16 lg:px-24 py-12 max-w-[680px]">

                {/* Title */}
                <h1 className="text-[2.4rem] font-extrabold text-gray-900 dark:text-gray-100 leading-tight tracking-tight mb-1 shrink-0">
                    Create Account!
                </h1>
                <p className="text-[0.95rem] text-gray-400 dark:text-gray-400 mb-5 leading-relaxed shrink-0">
                    Join <strong className="text-gray-600 dark:text-gray-300">Inter.Ship</strong> and start your internship journey. Get started for free.
                </p>

                {/* ─── Role Tabs ─── */}
                <div className="flex mb-6 shrink-0 border-b border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={() => handleRoleChange("student")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold cursor-pointer bg-transparent border-none transition-all duration-300 relative ${role === "student"
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            }`}
                        id="role-student-btn"
                    >
                        Student
                        {role === "student" && (
                            <span className="absolute bottom-0 left-[20%] right-[20%] h-[2.5px] rounded-full" style={{ background: "linear-gradient(90deg, #7c3aed, #ec4899)" }} />
                        )}
                    </button>
                    <div className="w-px bg-gray-200 dark:border-gray-700 my-2" />
                    <button
                        type="button"
                        onClick={() => handleRoleChange("company")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold cursor-pointer bg-transparent border-none transition-all duration-300 relative ${role === "company"
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            }`}
                        id="role-company-btn"
                    >
                        Company
                        {role === "company" && (
                            <span className="absolute bottom-0 left-[20%] right-[20%] h-[2.5px] rounded-full" style={{ background: "linear-gradient(90deg, #7c3aed, #ec4899)" }} />
                        )}
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4" id="register-form" noValidate>

                    {/* --- Student Fields ---  */}
                    {role === "student" && (
                        <>
                            {/* First Name & Last Name side by side */}
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <input
                                        id="register-firstname"
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => { setFirstName(e.target.value); setErrors(prev => ({ ...prev, firstName: null })); }}
                                        placeholder="First Name"
                                        autoComplete="given-name"
                                        className={inputClass("firstName")}
                                    />
                                    {errorMsg("firstName")}
                                </div>
                                <div className="flex-1">
                                    <input
                                        id="register-lastname"
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => { setLastName(e.target.value); setErrors(prev => ({ ...prev, lastName: null })); }}
                                        placeholder="Last Name"
                                        autoComplete="family-name"
                                        className={inputClass("lastName")}
                                    />
                                    {errorMsg("lastName")}
                                </div>
                            </div>
                        </>
                    )}

                    {/* --- Company Fields --- */}
                    {role === "company" && (
                        <div>
                            <input
                                id="register-companyname"
                                type="text"
                                value={companyName}
                                onChange={(e) => { setCompanyName(e.target.value); setErrors(prev => ({ ...prev, companyName: null })); }}
                                placeholder="Name of Company"
                                autoComplete="organization"
                                className={inputClass("companyName")}
                            />
                            {errorMsg("companyName")}
                        </div>
                    )}

                    {/* Email (common) */}
                    <div>
                        <input
                            id="register-email"
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: null })); }}
                            placeholder="Email"
                            autoComplete="email"
                            className={inputClass("email")}
                        />
                        {errorMsg("email")}
                    </div>

                    {/* Password (common) */}
                    <div>
                        <div className="relative">
                            <input
                                id="register-password"
                                type={showPw ? "text" : "password"}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: null })); }}
                                placeholder="Password"
                                autoComplete="new-password"
                                className={`${inputClass("password")} pr-12`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(!showPw)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-indigo-300 flex items-center"
                                aria-label="Toggle password visibility"
                                tabIndex={-1}
                            >
                                <EyeIcon open={showPw} />
                            </button>
                        </div>
                        {errorMsg("password")}
                    </div>

                    {/* Confirm Password (common) */}
                    <div>
                        <div className="relative">
                            <input
                                id="register-confirm-password"
                                type={showConfirmPw ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: null })); }}
                                placeholder="Confirm Password"
                                autoComplete="new-password"
                                className={`${inputClass("confirmPassword")} pr-12`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPw(!showConfirmPw)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-indigo-300 flex items-center"
                                aria-label="Toggle confirm password visibility"
                                tabIndex={-1}
                            >
                                <EyeIcon open={showConfirmPw} />
                            </button>
                        </div>
                        {errorMsg("confirmPassword")}
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

                {/* --- Social Login — Only for Company --- */}
                {role === "company" && (
                    <>
                        {/* Divider */}
                        <div className="flex items-center gap-4 my-5">
                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                            <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap tracking-wide">or continue with</span>
                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        </div>

                        {/* Social Buttons */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                id="register-google-btn"
                                onClick={() => window.location.href = '/auth/google/'}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 border-[1.5px] border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer transition-all hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50/40 dark:hover:bg-purple-500/10 hover:shadow-sm active:scale-[0.98]"
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-[18px] h-[18px]" />
                                Google
                            </button>

                            <button
                                type="button"
                                id="register-github-btn"
                                onClick={() => window.location.href = '/auth/github/'}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 border-[1.5px] border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer transition-all hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50/40 dark:hover:bg-purple-500/10 hover:shadow-sm active:scale-[0.98]"
                            >
                                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" className="w-[18px] h-[18px] dark:invert" />
                                GitHub
                            </button>
                        </div>
                    </>
                )}

                {/* Login link */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 shrink-0">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-indigo-950 dark:text-purple-400 font-bold no-underline hover:text-purple-600 dark:hover:text-purple-300 hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </div>

            {/* ====== RIGHT PANEL — Carousel ====== */}
            <div className="hidden md:flex flex-1 basis-1/2 items-center justify-center bg-[#FDF7FF] dark:bg-gray-900/50 relative overflow-hidden p-10">

                {/* Subtle decorative circles */}
                <div className="absolute top-[10%] right-[15%] w-20 h-20 rounded-full bg-gray-200/50 dark:bg-gray-700/30 blur-xl" />
                <div className="absolute bottom-[15%] left-[10%] w-32 h-32 rounded-full bg-gray-200/40 dark:bg-gray-700/20 blur-2xl" />

                {/* Left arrow */}
                <button
                    onClick={() => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-transparent border-none cursor-pointer text-7xl font-extralight text-gray-300 dark:text-gray-600 transition-all hover:text-purple-500 dark:hover:text-purple-400 hover:scale-110 active:scale-95 select-none"
                    aria-label="Previous slide"
                >
                    ‹
                </button>

                {/* Right arrow */}
                <button
                    onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-transparent border-none cursor-pointer text-7xl font-extralight text-gray-300 dark:text-gray-600 transition-all hover:text-purple-500 dark:hover:text-purple-400 hover:scale-110 active:scale-95 select-none"
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
                                className="absolute inset-0 text-center text-xl font-semibold text-gray-800 dark:text-gray-300 leading-relaxed tracking-tight transition-all duration-500"
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
                                    ? 'w-6 h-2 bg-gray-800 dark:bg-gray-300'
                                    : 'w-2 h-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'
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
