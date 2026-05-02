import { useState } from "react";
import api from "@/api/api";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Threads from "@/components/ui/Threads";
import premiumPhoto from "@/assets/premium_photo-1725534270555-84e4b39e6b90.avif";

function Register() {
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("STUDENT");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        let EmptyErrors = {};
        if (role === "STUDENT") {
            if (!firstName.trim()) EmptyErrors.firstName = "First name is required";
            if (!lastName.trim()) EmptyErrors.lastName = "Last name is required";
        } else {
            if (!username.trim()) EmptyErrors.username = "Username is required";
        }
        if (!email.trim()) {
            EmptyErrors.email = "Email is required";
        } else if (role === "STUDENT" && !email.toLowerCase().endsWith("@univ.dz")) {
            EmptyErrors.email = "Student email must end with @univ.dz";
        }
        if (!password) EmptyErrors.password = "Password is required";
        if (!confirmPassword) {
            EmptyErrors.confirmPassword = "Please confirm your password";
        } else if (password !== confirmPassword) {
            EmptyErrors.confirmPassword = "Passwords do not match";
        }

        if (Object.keys(EmptyErrors).length > 0) {
            setErrors(EmptyErrors);
            return;
        }

        setErrors({});
        setLoading(true);
        try {
            const payload = {
                email,
                password,
                role,
                ...(role === "STUDENT" 
                    ? { first_name: firstName, last_name: lastName } 
                    : { username, name: username })
            };
            await api.post("/auth/register/", payload);
            navigate("/login");
        } catch (error) {
            if (error.response && error.response.data) {
                const backendErrors = error.response.data;
                const newErrors = {};
                for (const key in backendErrors) {
                    newErrors[key] = Array.isArray(backendErrors[key]) ? backendErrors[key][0] : backendErrors[key];
                }
                setErrors(newErrors);
            } else {
                alert("Registration failed. Please check your connection and try again.");
            }
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

            <div className="relative z-10 w-full max-w-[850px] bg-white rounded-[24px] flex flex-col md:flex-row overflow-hidden p-2 min-h-[500px] md:min-h-[550px] gap-3 md:gap-4 shadow-2xl">
                
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

                {/* Right Side - Form */}
                <div className="w-full md:w-[50%] flex flex-col pt-5 pb-5 px-4 md:px-6 md:pr-8">
                    <span className="text-lg font-semibold tracking-tight text-black font-sans">
                        InterShip.
                    </span>

                    <div className="flex-1 flex flex-col justify-center max-w-[360px] mx-auto w-full">
                        {/* Back Button */}
                        <button onClick={() => navigate(-1)} className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center mb-3 hover:bg-purple-50 transition-colors self-start">
                            <ChevronLeft className="w-3.5 h-3.5 text-purple-600" />
                        </button>

                        <h1 className="text-[22px] font-semibold text-black mb-1.5 tracking-tighter font-sans">Create an account</h1>
                        <p className="text-slate-500 text-[13px] mb-4 leading-relaxed font-light font-sans">
                            Enter your details below to create your InterShip account.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            {role === "STUDENT" ? (
                                <div className="flex gap-3">
                                    <div className="space-y-1 flex-1">
                                        <label className="text-[11px] font-semibold text-black ml-1">First Name</label>
                                        <input
                                            type="text"
                                            placeholder="John"
                                            value={firstName}
                                            onChange={(e) => { setFirstName(e.target.value); setErrors(prev => ({ ...prev, firstName: null })) }}
                                            className="w-full h-[40px] px-3.5 rounded-[12px] border border-slate-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 bg-white transition-all text-[13px] font-medium placeholder:text-slate-400 font-sans"
                                        />
                                        {errors.firstName && <p className="text-[10px] text-red-500 ml-1">{errors.firstName}</p>}
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <label className="text-[11px] font-semibold text-black ml-1">Last Name</label>
                                        <input
                                            type="text"
                                            placeholder="Doe"
                                            value={lastName}
                                            onChange={(e) => { setLastName(e.target.value); setErrors(prev => ({ ...prev, lastName: null })) }}
                                            className="w-full h-[40px] px-3.5 rounded-[12px] border border-slate-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 bg-white transition-all text-[13px] font-medium placeholder:text-slate-400 font-sans"
                                        />
                                        {errors.lastName && <p className="text-[10px] text-red-500 ml-1">{errors.lastName}</p>}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-black ml-1">Username</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="johndoe"
                                            value={username}
                                            onChange={(e) => { setUsername(e.target.value); setErrors(prev => ({ ...prev, username: null })) }}
                                            className="w-full h-[40px] px-3.5 rounded-[12px] border border-slate-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 bg-white transition-all text-[13px] font-medium placeholder:text-slate-400 font-sans"
                                        />
                                    </div>
                                    {errors.username && <p className="text-[10px] text-red-500 ml-1">{errors.username}</p>}
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-black ml-1">Email address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        placeholder={role === "STUDENT" ? "name@univ.dz" : "m@example.com"}
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: null })) }}
                                        className="w-full h-[40px] px-3.5 rounded-[12px] border border-slate-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 bg-white transition-all text-[13px] font-medium placeholder:text-slate-400 font-sans"
                                    />
                                </div>
                                {errors.email && <p className="text-[10px] text-red-500 ml-1">{errors.email}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-black ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: null })) }}
                                        className="w-full h-[40px] px-3.5 rounded-[12px] border border-slate-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 bg-white transition-all text-[13px] font-medium placeholder:text-slate-400 font-sans"
                                    />
                                </div>
                                {errors.password && <p className="text-[10px] text-red-500 ml-1">{errors.password}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-black ml-1">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: null })) }}
                                        className="w-full h-[40px] px-3.5 rounded-[12px] border border-slate-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 bg-white transition-all text-[13px] font-medium placeholder:text-slate-400 font-sans"
                                    />
                                </div>
                                {errors.confirmPassword && <p className="text-[10px] text-red-500 ml-1">{errors.confirmPassword}</p>}
                            </div>

                            <div className="space-y-1 pt-1">
                                <label className="text-[11px] font-semibold text-black ml-1">Register as</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => setRole("STUDENT")}
                                        className={`h-[36px] rounded-[12px] text-[12px] font-medium transition-all flex-1 ${role === 'STUDENT' ? 'bg-purple-50 text-purple-600 border border-purple-100 shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        Student
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole("COMPANY")}
                                        className={`h-[36px] rounded-[12px] text-[12px] font-medium transition-all flex-1 ${role === 'COMPANY' ? 'bg-purple-50 text-purple-600 border border-purple-100 shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        Company
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
                                        <span>Creating account...</span>
                                    </div>
                                ) : (
                                    "Sign Up"
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="mt-auto pt-4 flex justify-center md:justify-start">
                        <p className="text-[12px] font-medium text-slate-500">
                            Already have an account?{" "}
                            <Link to="/login" className="font-semibold text-purple-600 hover:text-purple-700 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
