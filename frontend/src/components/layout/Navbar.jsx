import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logoGif from "@/assets/logo.gif";
import {
    Menu, X, User, Settings, LogOut,
    ChevronDown, LayoutDashboard, Bell, Sun, Moon
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import api from "@/api/api";
import { ACCESS_TOKEN } from "@/constants";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Navbar({ children }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, setTheme } = useTheme();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                setIsVisible(false); // Hide on scroll down
            } else {
                setIsVisible(true);  // Show on scroll up
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem(ACCESS_TOKEN);
                if (token) {
                    const res = await api.get('/auth/profile/');
                    setUserInfo(res.data);
                } else {
                    setUserInfo(null);
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                setUserInfo(null);
            }
        };
        fetchProfile();
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.clear();
        setUserInfo(null);
        navigate("/login");
    };

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "Internships", path: "/internships" },
        { name: "Companies", path: "/companies" },
        { name: "Applications", path: "/applications" },
        { name: "About Us", path: "/about" },

    ];

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans antialiased tracking-tight">
            <nav className={`fixed top-0 left-0 right-0 z-[100] bg-background border-b border-border duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <img src={logoGif} alt="Inter.Ship" className="w-8 h-8 rounded-md" />
                        <span className="text-xl font-bold tracking-tight text-purple-600 font-['Poppins',sans-serif]">
                            Inter<span className="text-purple-400">.Ship</span>
                        </span>
                    </Link>

                                {/* Desktop Menu */}
                                <div className="hidden md:flex items-center gap-2">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            className={`px-3 py-2 rounded-md font-bold text-[13px] transition-colors ${location.pathname === link.path ? "text-primary bg-slate-50/50" : "text-slate-600 hover:text-primary"
                                                }`}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}

                                    <div className="h-4 w-px bg-border mx-1"></div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                        className="rounded-full w-9 h-9 text-muted-foreground hover:text-primary hover:bg-accent transition-all shadow-none"
                                    >
                                        {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
                                        <span className="sr-only">Toggle theme</span>
                                    </Button>

                                    <div className="h-4 w-px bg-border mx-1"></div>

                                    {userInfo ? (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="relative h-10 w-auto flex items-center gap-2.5 pl-1 pr-3.5 hover:bg-accent rounded-full group transition-all duration-200 outline-none border border-transparent hover:border-border bg-transparent">
                                                <Avatar className="h-8 w-8 border border-border shadow-sm ring-1 ring-border group-hover:ring-primary/20 transition-all">
                                                    {userInfo.profile_picture && (
                                                        <img src={userInfo.profile_picture} alt={userInfo.username} className="h-full w-full object-cover" />
                                                    )}
                                                    <AvatarFallback className="bg-primary text-white text-[10px] font-medium uppercase">
                                                        {userInfo.username?.charAt(0).toUpperCase() || 'A'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="text-left hidden lg:block pr-1">
                                                    <p className="text-xs font-semibold text-slate-900 leading-none mb-1">{userInfo.username}</p>
                                                    <p className="text-[10px] text-primary font-medium">
                                                        {userInfo.role === 'company' ? 'Company' : userInfo.role?.replace('_', ' ')}
                                                    </p>
                                                </div>
                                                <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-primary transition-colors" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56 mt-2 rounded-2xl p-2 shadow-2xl border border-border bg-popover text-popover-foreground" align="end">
                                                <div className="font-normal px-3 py-3">
                                                    <div className="flex flex-col space-y-1">
                                                        <p className="text-sm font-bold text-foreground leading-none">{userInfo.username}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{userInfo.email}</p>
                                                    </div>
                                                </div>
                                                <DropdownMenuSeparator className="bg-border" />
                                                <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer font-medium text-sm text-slate-700 dark:text-slate-200 p-2.5 rounded-xl flex items-center hover:bg-accent transition-colors w-full">
                                                    <LayoutDashboard className="mr-3 h-4 w-4 text-primary" />
                                                    Dashboard
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer font-medium text-sm text-slate-700 dark:text-slate-200 p-2.5 rounded-xl flex items-center hover:bg-accent transition-colors w-full">
                                                    <User className="mr-3 h-4 w-4 text-primary" />
                                                    View Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer font-medium text-sm text-slate-700 dark:text-slate-200 p-2.5 rounded-xl flex items-center hover:bg-accent transition-colors w-full">
                                                    <Settings className="mr-3 h-4 w-4 text-primary" />
                                                    Settings
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-border" />
                                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer font-semibold text-sm text-red-600 dark:text-red-400 p-2.5 rounded-xl flex items-center hover:bg-red-50 dark:hover:bg-red-500/10 focus:bg-red-50 dark:focus:bg-red-500/10 transition-colors w-full">
                                                    <LogOut className="mr-3 h-4 w-4" />
                                                    Logout
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <Link to="/login">
                                                <Button variant="ghost" className="text-[13px] font-medium text-slate-600 hover:text-primary transition-colors px-4 h-9 shadow-none">
                                                    Log In
                                                </Button>
                                            </Link>
                                            <Link to="/register">
                                                <Button className="bg-primary hover:bg-primary/90 text-white text-[13px] font-bold rounded-full px-6 h-9 shadow-lg shadow-primary/20 active:scale-95 transition-all border-none">
                                                    Register
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Mobile Menu Button */}
                                <button
                                    className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                    onClick={() => setMenuOpen(!menuOpen)}
                                >
                                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                                </button>
                            </div>

                            {/* Mobile Menu */}
                            {menuOpen && (
                                <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-100 p-6 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-4">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            className={`block py-3.5 px-4 rounded-xl text-[13px] font-bold transition-all ${location.pathname === link.path ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"
                                                }`}
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}

                                    <div className="h-px bg-slate-100 my-4"></div>

                                    {userInfo ? (
                                        <div className="space-y-4 px-2">
                                            <div className="flex items-center gap-4 py-2">
                                                <Avatar className="h-10 w-10">
                                                    {userInfo.profile_picture && (
                                                        <img src={userInfo.profile_picture} alt={userInfo.username} className="h-full w-full object-cover" />
                                                    )}
                                                    <AvatarFallback className="bg-primary text-white font-medium">{userInfo.username?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">{userInfo.username}</p>
                                                    <p className="text-xs text-primary font-medium">{userInfo.role?.replace('_', ' ')}</p>
                                                </div>
                                            </div>
                                            <Link to="/dashboard" className="block py-3.5 px-2 text-[13px] font-bold text-primary" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                                            <button onClick={handleLogout} className="block w-full text-left py-3.5 px-2 text-[13px] font-bold text-red-600">Logout</button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 pt-2">
                                            <Link to="/login" className="block w-full text-center py-3.5 border border-slate-100 hover:bg-slate-50 rounded-xl font-medium text-[13px] text-slate-900 transition-all" onClick={() => setMenuOpen(false)}>Log In</Link>
                                            <Link to="/register" className="block w-full text-center py-3.5 bg-primary hover:bg-primary/95 rounded-xl font-bold text-[13px] text-white shadow-xl shadow-primary/10 transition-all" onClick={() => setMenuOpen(false)}>Register</Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </nav>

                        {/* Spacer for fixed navbar */}
                        <div className="h-16"></div>

                        {children}
                    </div>
    );
    
}
