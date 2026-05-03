import { useState } from "react";
import api from "@/api/api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader2, Eye, EyeOff } from "lucide-react";
import Threads from "@/components/ui/Threads";
import premiumPhoto from "@/assets/premium_photo-1725534270555-84e4b39e6b90.avif";
import ForgotPasswordModal from "@/pages/ForgotPassword";
import { useLanguage } from "@/components/language-provider";
import { useToast } from "@/components/ui/custom-toast";

function Login() {
    const { t } = useLanguage();
    const toast = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        let EmptyErrors = {};
        if (!email.trim()) EmptyErrors.email = "Email is required";
        if (!password) EmptyErrors.password = "Password is required";

        if (Object.keys(EmptyErrors).length > 0) {
            setErrors(EmptyErrors);
            return;
        }

        setErrors({});
        setLoading(true);
        try {
            const res = await api.post("/auth/login/", { email, password });
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
            navigate("/");
        } catch (error) {
            toast.error("Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 w-full flex items-center justify-center p-4 md:p-6 relative overflow-hidden font-sans">
            {/* ─── Background Threads ─── */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                <Threads
                    color={[0.66, 0.33, 0.98]}
                    amplitude={0.8}
                    distance={0.1}
                    enableMouseInteraction
                />
            </div>

            <div className="relative z-10 w-full max-w-[850px] bg-white rounded-[24px] flex flex-col md:flex-row overflow-hidden p-2 min-h-[500px] md:h-[550px] gap-3 md:gap-4 shadow-2xl">

                {/* Left Side - Image & Quote */}
                <div className="hidden md:flex md:w-[50%] relative rounded-[18px] overflow-hidden">
                    <img
                        src={premiumPhoto}
                        alt="Professional"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white flex flex-col justify-end">
                        <h2 className="text-[20px] md:text-[22px] font-semibold leading-[1.3] mb-4 tracking-tight font-sans">
                            "InterShip has streamlined our hiring process. Our platform connects top talent with the best companies seamlessly."
                        </h2>

                        <div className="mb-3">
                            <p className="font-semibold text-sm">John Doe</p>
                            <p className="text-white/80 text-[11px]">HR Manager</p>
                        </div>

                        <div className="flex gap-2 mt-1">
                            <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm hover:bg-white/15 transition-colors">
                                <ChevronLeft className="w-3.5 h-3.5 text-white/80" strokeWidth={1.5} />
                            </button>
                            <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm hover:bg-white/15 transition-colors">
                                <ChevronRight className="w-3.5 h-3.5 text-white/80" strokeWidth={1.5} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full md:w-[50%] flex flex-col pt-5 pb-5 px-4 md:px-6 md:pr-8">
                    <span className="text-lg font-semibold tracking-tight text-black font-sans">
                        InterShip.
                    </span>

                    <div className="flex-1 flex flex-col justify-center max-w-[360px] mx-auto w-full">
                        {/* Back Button */}
                        <button onClick={() => navigate(-1)} className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center mb-4 hover:bg-purple-50 transition-colors self-start">
                            <ChevronLeft className="w-3.5 h-3.5 text-purple-600" />
                        </button>

                        <h1 className="text-[22px] font-semibold text-black mb-1.5 tracking-tighter font-sans">{t("letsJoinUs")}</h1>
                        <p className="text-slate-500 text-[13px] mb-5 leading-relaxed font-light font-sans">
                            {t("signInJoin")}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-black ml-1">{t("email")}</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder={t("enterEmail")}
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: null })) }}
                                        className="w-full h-[42px] px-3.5 rounded-[12px] border border-slate-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 bg-white transition-all text-[13px] font-medium placeholder:text-slate-400 font-sans"
                                    />
                                </div>
                                {errors.email && <p className="text-[10px] text-red-500 ml-1">{errors.email}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-black ml-1">{t("password")}</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: null })) }}
                                        className="w-full h-[42px] px-3.5 pr-10 rounded-[12px] border border-slate-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 bg-white transition-all text-[13px] font-medium placeholder:text-slate-400 font-sans"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-[10px] text-red-500 ml-1">{errors.password}</p>}
                                <div className="flex justify-end px-1 mt-1">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsForgotModalOpen(true)}
                                        className="text-[11px] font-medium text-purple-600 hover:text-purple-700 transition-colors"
                                    >
                                        {t("forgotPassword")}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-[42px] bg-purple-600 hover:bg-purple-700 text-white text-[13px] font-medium rounded-[12px] shadow-md transition-all mt-4 flex items-center justify-center font-sans active:scale-[0.98]"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>{t("loggingIn")}</span>
                                    </div>
                                ) : (
                                    t("login")
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="mt-auto pt-4 flex justify-center md:justify-start">
                        <p className="text-[12px] font-medium text-slate-500">
                            {t("noAccount")}{" "}
                            <Link to="/register" className="font-semibold text-purple-600 hover:text-purple-700 transition-colors">
                                {t("signUp")}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <ForgotPasswordModal 
                isOpen={isForgotModalOpen} 
                onClose={() => setIsForgotModalOpen(false)} 
            />
        </div>
    );
}

export default Login;
