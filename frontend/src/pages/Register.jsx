import { useState, useEffect, useMemo } from "react";
import api from "@/api/api";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Loader2, Eye, EyeOff, ArrowLeft, ArrowRight } from "lucide-react";
import Threads from "@/components/ui/Threads";
import premiumPhoto from "@/assets/premium_photo-1725534270555-84e4b39e6b90.avif";
import { useLanguage } from "@/components/language-provider";
import { useToast } from "@/components/ui/custom-toast";

const fallbackUniversities = [
    { id: 6, name: "Université Abdelhamid Mehri - Constantine 2", email_domain: "@univ-constantine2.dz" },
    { id: 7, name: "Université des Frères Mentouri - Constantine 1", email_domain: "@univ-constantine1.dz" }
];

const fallbackDepartments = {
    6: [
        { id: 101, name: "Informatique (NTIC)" },
        { id: 102, name: "Mathématiques" },
        { id: 103, name: "Économie" }
    ],
    7: [
        { id: 201, name: "Sciences de la Nature et de la Vie" },
        { id: 202, name: "Droit" },
        { id: 203, name: "Lettres et Langues" }
    ]
};

function Register() {
    const { t } = useLanguage();
    const toast = useToast();
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [matricule, setMatricule] = useState("");
    const [role, setRole] = useState("STUDENT");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const memoizedThreads = useMemo(() => (
        <Threads
            color={[0.06, 0.27, 0.54]}
            amplitude={0.8}
            distance={0.1}
            enableMouseInteraction
        />
    ), []);

    const [universities, setUniversities] = useState([]);
    const [selectedUniv, setSelectedUniv] = useState("");
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState("");
    const [selectedUnivDomain, setSelectedUnivDomain] = useState("");

    const normalizeDomain = (domain) => {
        if (!domain) return "";
        const cleaned = domain.trim().toLowerCase();
        return cleaned.startsWith("@") ? cleaned : `@${cleaned}`;
    };

    useEffect(() => {
        api.get("/universities/")
            .then((res) => {
                if (res.data && res.data.length > 0) {
                    setUniversities(res.data);
                } else {
                    console.log("Empty university list from API, using fallback.");
                    setUniversities(fallbackUniversities);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch universities, using fallback:", err);
                setUniversities(fallbackUniversities);
            });
    }, []);

    const handleUnivChange = (univId) => {
        setSelectedUniv(univId);
        setErrors(prev => ({ ...prev, university: null }));

        if (univId) {
            api.get(`/departments/?university_id=${univId}`)
                .then((res) => {
                    if (res.data && res.data.length > 0) {
                        setDepartments(res.data);
                    } else {
                        console.log("Empty department list from API, using fallback.");
                        setDepartments(fallbackDepartments[univId] || []);
                    }
                })
                .catch((err) => {
                    console.error("Failed to fetch departments, using fallback:", err);
                    setDepartments(fallbackDepartments[univId] || []);
                });
            const univ = [...universities, ...fallbackUniversities].find(u => String(u.id) === String(univId));
            setSelectedUnivDomain(normalizeDomain(univ?.email_domain || ""));
        } else {
            setDepartments([]);
            setSelectedUnivDomain("");
        }
        setSelectedDept("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let EmptyErrors = {};
        if (role === "STUDENT") {
            if (!firstName.trim()) EmptyErrors.firstName = "First name is required";
            if (!lastName.trim()) EmptyErrors.lastName = "Last name is required";
            if (!selectedUniv) EmptyErrors.university = "University is required";
            if (!selectedDept) EmptyErrors.department = "Department is required";
        } else {
            if (!username.trim()) EmptyErrors.username = "Username is required";
        }
        if (!email.trim()) {
            EmptyErrors.email = "Email is required";
        } else if (role === "STUDENT") {
            const requiredDomain = selectedUnivDomain || "@univ.dz";
            if (!email.toLowerCase().endsWith(requiredDomain)) {
                EmptyErrors.email = `Student email must end with ${requiredDomain}`;
            }
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
                    ? {
                        first_name: firstName,
                        last_name: lastName,
                        department_id: Number(selectedDept)
                    }
                    : { username, name: username, matricule })
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

                // Show a toast message for the validation errors
                if (newErrors.matricule) {
                    toast.error(newErrors.matricule);
                } else {
                    const firstErrorKey = Object.keys(newErrors)[0];
                    if (firstErrorKey) {
                        toast.error(newErrors[firstErrorKey]);
                    }
                }
            } else {
                toast.error("Registration failed. Please check your connection and try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 w-full flex items-center justify-center p-4 md:p-6 relative overflow-hidden font-sans">
            {/* ─── Background Threads ─── */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                {memoizedThreads}
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

                        <div className="flex gap-3 mt-1">
                            <button className="bg-none border-none p-0 flex items-center justify-center cursor-pointer opacity-75 hover:opacity-100 transition-opacity">
                                <ArrowLeft className="w-4 h-4 text-white" strokeWidth={1.75} />
                            </button>
                            <button className="bg-none border-none p-0 flex items-center justify-center cursor-pointer opacity-75 hover:opacity-100 transition-opacity">
                                <ArrowRight className="w-4 h-4 text-white" strokeWidth={1.75} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-[50%] flex flex-col pt-5 pb-5 px-4 md:px-6 md:pr-8">
                    <Link to="/" className="text-lg font-semibold tracking-tight text-primary font-sans hover:opacity-80 transition-opacity">
                        Internia<span className="text-red-500">.</span>
                    </Link>

                    <div className="flex-1 flex flex-col justify-center max-w-[360px] mx-auto w-full">
                        {/* Back Button */}
                        <button onClick={() => navigate(-1)} className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center mb-3 hover:bg-primary/5 transition-colors self-start">
                            <ChevronLeft className="w-3.5 h-3.5 text-primary" />
                        </button>

                        <h1 className="text-[22px] font-semibold text-black mb-1.5 tracking-tighter font-sans">{t("createAccount")}</h1>
                        <p className="text-slate-500 text-[13px] mb-4 leading-relaxed font-light font-sans">
                            {t("createAccountDesc")}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            {role === "STUDENT" ? (
                                <>
                                    <div className="flex gap-3">
                                        <div className="space-y-1 flex-1">
                                            <label className="text-[11px] font-semibold text-black ml-1">{t("firstName")}</label>
                                            <input
                                                type="text"
                                                placeholder={t("firstName")}
                                                value={firstName}
                                                onChange={(e) => { setFirstName(e.target.value); setErrors(prev => ({ ...prev, firstName: null })) }}
                                                className="w-full h-[40px] px-3.5 rounded-[12px] border border-slate-200 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 bg-white transition-all text-[13px] font-medium placeholder:text-slate-400 font-sans"
                                            />
                                            {errors.firstName && <p className="text-[10px] text-red-500 ml-1">{errors.firstName}</p>}
                                        </div>
                                        <div className="space-y-1 flex-1">
                                            <label className="text-[11px] font-semibold text-black ml-1">{t("lastName")}</label>
                                            <input
                                                type="text"
                                                placeholder={t("lastName")}
                                                value={lastName}
                                                onChange={(e) => { setLastName(e.target.value); setErrors(prev => ({ ...prev, lastName: null })) }}
                                                className="w-full h-[40px] px-3.5 rounded-[12px] border border-slate-200 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 bg-white transition-all text-[13px] font-medium placeholder:text-slate-400 font-sans"
                                            />
                                            {errors.lastName && <p className="text-[10px] text-red-500 ml-1">{errors.lastName}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-black ml-1">{t("university") || "University"}</label>
                                        <div className="relative">
                                            <select
                                                value={selectedUniv}
                                                onChange={(e) => handleUnivChange(e.target.value)}
                                                className={`w-full h-[40px] px-3.5 rounded-[12px] border border-slate-200 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 bg-white transition-all text-[13px] font-medium placeholder:text-slate-400 font-sans cursor-pointer appearance-none pr-10 ${selectedUniv ? "text-black" : "text-slate-400"}`}
                                                style={{
                                                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238e8e93' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                                    backgroundRepeat: "no-repeat",
                                                    backgroundPosition: "right 14px center",
                                                    backgroundSize: "14px",
                                                }}
                                            >
                                                <option value="" disabled className="text-slate-400">Select your university</option>
                                                {universities.map((u) => (
                                                    <option key={u.id} value={u.id} className="text-black">{u.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.university && <p className="text-[10px] text-red-500 ml-1">{errors.university}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-black ml-1">{t("department") || "Department"}</label>
                                        <div className="relative">
                                            <select
                                                value={selectedDept}
                                                onChange={(e) => { setSelectedDept(e.target.value); setErrors(prev => ({ ...prev, department: null })) }}
                                                className={`w-full h-[40px] px-3.5 rounded-[12px] border border-slate-200 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 bg-white transition-all text-[13px] font-medium placeholder:text-slate-400 font-sans cursor-pointer appearance-none pr-10 ${selectedDept ? "text-black" : "text-slate-400"}`}
                                                style={{
                                                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238e8e93' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                                    backgroundRepeat: "no-repeat",
                                                    backgroundPosition: "right 14px center",
                                                    backgroundSize: "14px",
                                                }}
                                            >
                                                <option value="" disabled className="text-slate-400">Select your department</option>
                                                {departments.map((d) => (
                                                    <option key={d.id} value={d.id} className="text-black">{d.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.department && <p className="text-[10px] text-red-500 ml-1">{errors.department}</p>}
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-black ml-1">{role === "COMPANY" ? (t("companyName") || "Company Name") : t("username")}</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder={role === "COMPANY" ? "Name of Company" : "johndoe"}
                                            value={username}
                                            onChange={(e) => { setUsername(e.target.value); setErrors(prev => ({ ...prev, username: null })) }}
                                            className="w-full h-[40px] px-3.5 rounded-[12px] border border-slate-200 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 bg-white transition-all text-[13px] font-medium placeholder:text-slate-400 font-sans"
                                        />
                                    </div>

                                    {role === "COMPANY" && (
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-semibold text-black ml-1">Registration Number (Optional)</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="MAT-XXXXXXXX"
                                                    value={matricule}
                                                    onChange={(e) => { setMatricule(e.target.value); setErrors(prev => ({ ...prev, matricule: null })) }}
                                                    className="w-full h-[40px] px-3.5 rounded-[12px] border border-slate-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 bg-white transition-all text-[13px] font-medium placeholder:text-slate-400 font-sans"
                                                />
                                            </div>
                                            {errors.matricule && <p className="text-[10px] text-red-500 ml-1">{errors.matricule}</p>}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-black ml-1">{t("email")}</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        placeholder={role === "STUDENT" ? "name@univ.dz" : "m@example.com"}
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: null })) }}
                                        className="w-full h-[40px] px-3.5 rounded-[12px] border border-slate-200 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 bg-white transition-all text-[13px] font-medium placeholder:text-slate-400 font-sans"
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
                                        className="w-full h-[40px] px-3.5 pr-10 rounded-[12px] border border-slate-200 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 bg-white transition-all text-[13px] font-medium placeholder:text-slate-400 font-sans"
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
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-black ml-1">{t("confirmPassword")}</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: null })) }}
                                        className="w-full h-[40px] px-3.5 pr-10 rounded-[12px] border border-slate-200 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 bg-white transition-all text-[13px] font-medium placeholder:text-slate-400 font-sans"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="text-[10px] text-red-500 ml-1">{errors.confirmPassword}</p>}
                            </div>

                            <div className="space-y-1 pt-1">
                                <label className="text-[11px] font-semibold text-black ml-1">{t("registerAs")}</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => setRole("STUDENT")}
                                        className={`h-[36px] rounded-[12px] text-[12px] font-medium transition-all flex-1 ${role === 'STUDENT' ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {t("student")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole("COMPANY")}
                                        className={`h-[36px] rounded-[12px] text-[12px] font-medium transition-all flex-1 ${role === 'COMPANY' ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {t("company")}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-[42px] bg-primary hover:bg-primary/90 text-white text-[13px] font-medium rounded-[12px] shadow-md transition-all mt-4 flex items-center justify-center font-sans active:scale-[0.98]"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>{t("creatingAccount")}</span>
                                    </div>
                                ) : (
                                    t("signUp")
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="mt-auto pt-4 flex justify-center md:justify-start">
                        <p className="text-[12px] font-medium text-slate-500">
                            {t("alreadyHaveAccount")}{" "}
                            <Link to="/login" className="font-semibold text-secondary hover:text-secondary/90 transition-colors">
                                {t("login")}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
