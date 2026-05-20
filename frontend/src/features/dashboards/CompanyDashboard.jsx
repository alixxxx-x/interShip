import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Plus,
  Heart,
  Eye,
  CheckCircle2,
  Circle,
  ArrowUpRight,
  FileText,
  Building2,
  Calendar,
  Sparkles,
  RefreshCw,
  Search,
  Bell,
  MoreHorizontal,
  ChevronDown,
  Clock,
  SlidersHorizontal,
  ArrowUpDown,
  BookOpen,
  Zap,
  GraduationCap,
  Layers
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import api from "@/api/api";
import { useToast } from "@/components/ui/custom-toast";
import { useTheme } from "@/components/theme-provider";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, CartesianGrid } from "recharts";
export default function CompanyDashboard() {
  const toast = useToast();
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const navigate = useNavigate();

  const openModal = () => navigate("/companydashboard/new-offer");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [res, notifRes] = await Promise.all([
        api.get("/company/dashboard/"),
        api.get("/notifications/").catch(err => {
          console.error("Failed to fetch unread count:", err);
          return { data: { unreadCount: 0 } };
        })
      ]);

      const nextStats = res?.data?.stats ?? null;
      const nextApps = Array.isArray(res?.data?.applications) ? res.data.applications : [];

      setStats(nextStats);
      setApplications(nextApps);
      setUnreadNotificationsCount(notifRes?.data?.unreadCount ?? 0);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      setError("Failed to load dashboard data.");
      setStats(null);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-background">
        <div className="flex justify-between items-center">
          <div className="h-10 w-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 h-96 bg-muted animate-pulse rounded-xl" />
          <div className="h-96 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  // --- Reference Mock Data for Sparklines & Mini Charts ---
  const barData = [
    { value: 10 }, { value: 16 }, { value: 13 }, { value: 24 }, { value: 28 }
  ];
  const lineData1 = [
    { value: 8 }, { value: 15 }, { value: 11 }, { value: 18 }, { value: 25 }
  ];
  const lineData2 = [
    { value: 10 }, { value: 10 }, { value: 10 }, { value: 10 }, { value: 10 }
  ];

  // --- Donut Chart Data (Weekly Activity Split equivalent) ---
  const pieData = [
    { name: "IT & Software", value: 45, color: "#38bdf8" }, // Light Blue
    { name: "Creative & Design", value: 25, color: "#2563eb" }, // Blue
    { name: "Marketing", value: 20, color: "#db2777" }, // Pink
    { name: "Engineering", value: 10, color: "#4f46e5" }, // Indigo
  ];

  // --- Progress Overview Trend Data (gradient area chart) ---
  const flowTrendData = [
    { name: "1", value: 20 },
    { name: "5", value: 25 },
    { name: "10", value: 23 },
    { name: "15", value: 48 },
    { name: "20", value: 40 },
    { name: "25", value: 65 },
    { name: "30", value: 90 },
  ];

  const getStatusBadgeStyles = (status) => {
    const maps = {
      "Pending": "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 hover:bg-orange-500/15",
      "Accepted": "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 hover:bg-green-500/15",
      "Validated": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/15",
      "Completed": "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 hover:bg-green-500/15",
      "Rejected": "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/15",
      "Cancelled": "bg-muted text-muted-foreground border-muted-foreground/20 hover:bg-muted/80"
    };
    return maps[status] || "bg-muted text-muted-foreground border-muted-foreground/20";
  };

  const handleDownloadCV = async (application) => {
    try {
      const res = await api.get(`/cv/generate/${application.studentId}/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${application.candidate.replace(/\s+/g, '_')}_CV.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      if (application.cvUrl) {
        window.open(application.cvUrl, "_blank");
      } else {
        toast.warning(`No Digital CV or uploaded file available for ${application.candidate}`);
      }
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 animate-in fade-in duration-500 bg-background text-foreground">
      
      {/* 1. TOP HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-1">
        <div className="flex flex-col">
          <h1 className="text-[18px] sm:text-[20px] font-bold text-foreground leading-tight">Welcome Back Recruiter!</h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
            You've completed 3 application reviews today — keep it up!
          </p>
        </div>


        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          {/* Notification Button */}
          <div className="relative">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate("/companydashboard/notifications")}
              className="h-8.5 w-8.5 rounded-full bg-card border-border hover:bg-muted transition-colors"
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
            </Button>
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white ring-2 ring-background pointer-events-none">
                {unreadNotificationsCount}
              </span>
            )}
          </div>
          {/* Search bar */}
          <div className="relative w-48 sm:w-64 md:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search for Applications, Postings..." 
              className="w-full h-8.5 pl-8.5 pr-4 rounded-xl border border-input bg-card text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring transition"
            />
          </div>

          <Button variant="outline" size="icon" className="h-8.5 w-8.5 rounded-xl bg-card border-border hover:bg-muted transition-colors">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* 2. HIGHLIGHTS HEADER SECTION */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-semibold text-foreground">Highlights</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchDashboardData}
            className="text-[11px] text-muted-foreground hover:text-foreground gap-1 font-medium transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh Data
          </Button>
        </div>

        {/* HIGHLIGHTS GRID (4 Cards - 2 cols on mobile/tablet, 4 on desktop) */}
        <div className="grid gap-3 sm:gap-4 lg:gap-5 grid-cols-2 lg:grid-cols-4">
          
          {/* Highlight 1: Pending Applications */}
          <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-2 sm:p-3 md:p-3.5 lg:p-2.5 xl:p-4 2xl:p-5 flex flex-col justify-between">
              {/* Row 1: Icon + Label + Badge */}
              <div className="flex items-center gap-1.5 min-w-0">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 lg:h-3.5 lg:w-3.5 xl:h-4.5 xl:w-4.5 2xl:h-5 2xl:w-5 text-slate-500/80 flex-shrink-0" />
                <span className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-[10px] xl:text-xs 2xl:text-sm font-semibold text-slate-600 dark:text-slate-300 truncate leading-tight">Pending Reviews</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[8px] sm:text-[9px] md:text-[10px] lg:text-[8px] xl:text-[10px] 2xl:text-xs px-1 sm:px-1.5 py-0.5 rounded font-semibold shadow-none flex-shrink-0 ml-auto">+12%</Badge>
              </div>
              
              {/* Row 2: Value + Sparkline */}
              <div className="flex items-end justify-between mt-2 sm:mt-2.5 md:mt-3 lg:mt-2.5 xl:mt-4 2xl:mt-5">
                <span className="text-lg sm:text-xl md:text-2xl lg:text-lg xl:text-2xl 2xl:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  {String(stats?.pendingApplications ?? 0).padStart(2, '0')}
                </span>
                {/* Mini Bar Chart with Thin Bars */}
                <div className="w-10 h-5 sm:w-12 sm:h-6 md:w-14 md:h-7 lg:w-10 lg:h-5 xl:w-16 xl:h-8 2xl:w-20 2xl:h-10 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Bar dataKey="value" fill="#38bdf8" barSize={3.5} radius={[1, 1, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Highlight 2: Shortlisted Talent */}
          <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-2 sm:p-3 md:p-3.5 lg:p-2.5 xl:p-4 2xl:p-5 flex flex-col justify-between">
              {/* Row 1: Icon + Label + Badge */}
              <div className="flex items-center gap-1.5 min-w-0">
                <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 lg:h-3.5 lg:w-3.5 xl:h-4.5 xl:w-4.5 2xl:h-5 2xl:w-5 text-slate-500/80 flex-shrink-0" />
                <span className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-[10px] xl:text-xs 2xl:text-sm font-semibold text-slate-600 dark:text-slate-300 truncate leading-tight">Shortlisted Talent</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[8px] sm:text-[9px] md:text-[10px] lg:text-[8px] xl:text-[10px] 2xl:text-xs px-1 sm:px-1.5 py-0.5 rounded font-semibold shadow-none flex-shrink-0 ml-auto">+5%</Badge>
              </div>

              {/* Row 2: Value + Sparkline */}
              <div className="flex items-end justify-between mt-2 sm:mt-2.5 md:mt-3 lg:mt-2.5 xl:mt-4 2xl:mt-5">
                <span className="text-lg sm:text-xl md:text-2xl lg:text-lg xl:text-2xl 2xl:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  {String(stats?.acceptedApplications ?? 0).padStart(2, '0')}
                </span>
                {/* Mini Sparkline Line Chart */}
                <div className="w-10 h-5 sm:w-12 sm:h-6 md:w-14 md:h-7 lg:w-10 lg:h-5 xl:w-16 xl:h-8 2xl:w-20 2xl:h-10 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData1} margin={{ top: 3, right: 1, left: 1, bottom: 3 }}>
                      <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Highlight 3: Active Listings */}
          <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-2 sm:p-3 md:p-3.5 lg:p-2.5 xl:p-4 2xl:p-5 flex flex-col justify-between">
              {/* Row 1: Icon + Label + Badge */}
              <div className="flex items-center gap-1.5 min-w-0">
                <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 lg:h-3.5 lg:w-3.5 xl:h-4.5 xl:w-4.5 2xl:h-5 2xl:w-5 text-slate-500/80 flex-shrink-0" />
                <span className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-[10px] xl:text-xs 2xl:text-sm font-semibold text-slate-600 dark:text-slate-300 truncate leading-tight">Active Postings</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[8px] sm:text-[9px] md:text-[10px] lg:text-[8px] xl:text-[10px] 2xl:text-xs px-1 sm:px-1.5 py-0.5 rounded font-semibold shadow-none flex-shrink-0 ml-auto">+10%</Badge>
              </div>

              {/* Row 2: Value + Sparkline */}
              <div className="flex items-end justify-between mt-2 sm:mt-2.5 md:mt-3 lg:mt-2.5 xl:mt-4 2xl:mt-5">
                <span className="text-lg sm:text-xl md:text-2xl lg:text-lg xl:text-2xl 2xl:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  {String(stats?.totalInternships ?? 0).padStart(2, '0')}
                </span>
                {/* Mini Sparkline 2 */}
                <div className="w-10 h-5 sm:w-12 sm:h-6 md:w-14 md:h-7 lg:w-10 lg:h-5 xl:w-16 xl:h-8 2xl:w-20 2xl:h-10 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData2} margin={{ top: 3, right: 1, left: 1, bottom: 3 }}>
                      <Line type="monotone" dataKey="value" stroke="#eab308" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Highlight 4: Talent Score / Response */}
          <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-2 sm:p-3 md:p-3.5 lg:p-2.5 xl:p-4 2xl:p-5 flex flex-col justify-between">
              {/* Row 1: Icon + Label + Badge */}
              <div className="flex items-center gap-1.5 min-w-0">
                <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 lg:h-3.5 lg:w-3.5 xl:h-4.5 xl:w-4.5 2xl:h-5 2xl:w-5 text-slate-500/80 flex-shrink-0" />
                <span className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-[10px] xl:text-xs 2xl:text-sm font-semibold text-slate-600 dark:text-slate-300 truncate leading-tight">Recruitment Score</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[8px] sm:text-[9px] md:text-[10px] lg:text-[8px] xl:text-[10px] 2xl:text-xs px-1 sm:px-1.5 py-0.5 rounded font-semibold shadow-none flex-shrink-0 ml-auto">+6%</Badge>
              </div>

              {/* Row 2: Value + Streak Indicators */}
              <div className="flex items-end justify-between mt-2 sm:mt-2.5 md:mt-3 lg:mt-2.5 xl:mt-4 2xl:mt-5">
                <span className="text-lg sm:text-xl md:text-2xl lg:text-lg xl:text-2xl 2xl:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">92%</span>
                {/* Streak circles representation */}
                <div className="flex gap-0.5 sm:gap-1 mb-0.5 flex-shrink-0">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 lg:h-2.5 lg:w-2.5 xl:h-3.5 xl:w-3.5 2xl:h-4 2xl:w-4 rounded-full bg-sky-500 flex items-center justify-center shadow-sm">
                      <Zap className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 lg:h-1.5 lg:w-1.5 xl:h-2 xl:w-2 2xl:h-2.5 2xl:w-2.5 text-white fill-white" />
                    </div>
                  ))}
                  <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 lg:h-2.5 lg:w-2.5 xl:h-3.5 xl:w-3.5 2xl:h-4 2xl:w-4 rounded-full bg-muted flex items-center justify-center border border-border" />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
      {/* 3. MIDDLE ROW (Progress Overview & Activity Split equivalents) */}
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-3 items-start">
        
        {/* Progress Overview Card (2/3 width) */}
        <Card className="lg:col-span-2 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
            <div className="space-y-0.5">
              <CardTitle className="text-sm sm:text-base font-semibold text-foreground">Application Velocity</CardTitle>
              <CardDescription className="text-[10px] sm:text-[11px] text-muted-foreground">
                Your candidate sourcing trends and views activity.
              </CardDescription>
            </div>

            {/* Dropdown controls in header */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <Button variant="outline" size="sm" className="h-7 rounded-lg bg-muted/50 border-border text-[10px] sm:text-[11px] font-semibold gap-1 text-foreground hover:bg-muted px-2">
                <span>All Postings</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
              <Button variant="outline" size="sm" className="h-7 rounded-lg bg-muted/50 border-border text-[10px] sm:text-[11px] font-semibold gap-1 text-foreground hover:bg-muted px-2">
                <span>October</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Flow Area Chart */}
          <div className="h-[180px] sm:h-[210px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flowTrendData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card rounded-xl border border-border p-2.5 shadow-lg flex flex-col space-y-1">
                          <span className="text-[9px] font-bold text-muted-foreground">Oct 15, 2025</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-foreground">{payload[0].value}% rate</span>
                            <span className="text-[8px] font-bold text-emerald-600 bg-emerald-500/15 px-1 py-0.2 rounded">+5%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#38bdf8" 
                  strokeWidth={2}
                  fill="url(#colorVelocity)" 
                  activeDot={{ r: 5, stroke: '#38bdf8', strokeWidth: 1.5, fill: '#fff' }}
                />
                <defs>
                  <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Weekly Activity Split / Donut Chart Card (1/3 width) */}
        <Card className="rounded-2xl border border-border bg-card p-4 lg:p-3 xl:p-4 2xl:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1 min-w-0">
              <TrendingUp className="h-4 w-4 text-foreground flex-shrink-0" />
              <CardTitle className="text-xs sm:text-sm lg:text-xs xl:text-sm 2xl:text-base font-semibold text-foreground truncate">Talent Distribution</CardTitle>
            </div>
            
            {/* Header Mini Controls */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg text-muted-foreground hover:text-foreground">
                <Search className="h-3 w-3" />
              </Button>
              <div className="hidden md:flex items-center border border-border rounded-lg bg-muted/50 overflow-hidden">
                <button className="h-6 px-1.5 text-[9px] font-bold text-muted-foreground border-r border-border hover:bg-muted">&lt;</button>
                <button className="h-6 px-1.5 text-[9px] font-bold text-foreground hover:bg-muted">&gt;</button>
              </div>
            </div>
          </div>

          {/* Donut Chart visualization */}
          <div className="relative flex items-center justify-center h-[120px] sm:h-[135px] lg:h-[105px] xl:h-[130px] 2xl:h-[140px] my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={32}
                  outerRadius={46}
                  paddingAngle={4}
                  dataKey="value"
                  stroke={theme === "dark" ? "hsl(var(--card))" : "#ffffff"}
                  strokeWidth={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke={theme === "dark" ? "hsl(var(--card))" : "#ffffff"} />
                  ))}
                </Pie>
                <text
                  x="50%"
                  y="43%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "8px",
                    fontWeight: 500,
                    fill: "hsl(var(--muted-foreground))",
                    letterSpacing: "0.05em"
                  }}
                >
                  Participants
                </text>
                <text
                  x="50%"
                  y="59%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "16px",
                    fontWeight: 700,
                    fill: "hsl(var(--foreground))"
                  }}
                >
                  {applications.length ? applications.length + 39 : 42}
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Rows - 2x2 Capsule pills layout matching reference */}
          <div className="grid grid-cols-2 gap-1 sm:gap-1.5 mt-1 text-[9px] sm:text-xs lg:text-[10px] xl:text-xs 2xl:text-sm font-medium">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1 sm:gap-1.5 px-1.5 py-0.5 sm:py-1 lg:px-1 lg:py-0.5 xl:px-2 xl:py-1 2xl:px-2.5 2xl:py-1.5 rounded-md border border-border bg-muted/20 min-w-0">
                <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate text-muted-foreground w-full">{item.name}: <span className="font-bold text-foreground">{item.value}%</span></span>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* 4. BOTTOM ROW (Upcoming Deadlines & Quick Review equivalents) */}
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-3 items-start">
        
        {/* Recent Applications (Upcoming Deadlines equivalent) */}
        <Card className="lg:col-span-2 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-foreground" />
              <CardTitle className="text-sm sm:text-base font-semibold text-foreground">Recent Applications</CardTitle>
            </div>

            {/* Capsules search/sort/filter */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Filter table..." 
                  className="h-7 w-28 sm:w-36 pl-7 pr-2 rounded-lg border border-input bg-card text-[11px] text-foreground placeholder:text-muted-foreground outline-none focus:border-ring transition"
                />
              </div>
              <Button variant="outline" size="sm" className="h-7 rounded-lg bg-card border-border text-[10px] sm:text-[11px] font-semibold gap-1 text-muted-foreground hover:text-foreground px-2">
                <ArrowUpDown className="h-3 w-3" />
                <span>Sort</span>
              </Button>
              <Button variant="outline" size="sm" className="h-7 rounded-lg bg-card border-border text-[10px] sm:text-[11px] font-semibold gap-1 text-muted-foreground hover:text-foreground px-2">
                <SlidersHorizontal className="h-3 w-3" />
                <span>Filter</span>
              </Button>
            </div>
          </div>

          {/* Table content matching exact layout and styles */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium text-[10px] sm:text-[11px] py-2 pl-2 sm:pl-3">Candidate / Role</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-[10px] sm:text-[11px] py-2">Applied Date</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-[10px] sm:text-[11px] py-2 hidden md:table-cell">Email</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-[10px] sm:text-[11px] py-2">Status</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-[10px] sm:text-[11px] py-2 text-right pr-2 sm:pr-3">CV Document</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-[11px] text-muted-foreground">
                      No recent applications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app, idx) => (
                    <TableRow key={app.id || idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                      {/* Candidate with colored bullet matching subject domain */}
                      <TableCell className="py-2 pl-2 sm:pl-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                            idx === 0 ? "bg-[#38bdf8]" : idx === 1 ? "bg-[#2563eb]" : "bg-[#db2777]"
                          }`} />
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground text-[11px] sm:text-xs">{app.candidate}</span>
                            <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground">{app.internshipTitle || "Internship Offer"}</span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-2 text-[10px] sm:text-[11px] font-medium text-muted-foreground">
                        {app.appliedDate}
                      </TableCell>
                      
                      <TableCell className="py-2 text-[10px] sm:text-[11px] font-medium text-muted-foreground hidden md:table-cell">
                        {app.email}
                      </TableCell>
                      
                      {/* Status Badge styled in clean pastel background and matching text */}
                      <TableCell className="py-2">
                        <Badge className={`border px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-semibold shadow-none ${getStatusBadgeStyles(app.status)}`}>
                          {app.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-2 text-right pr-2 sm:pr-3">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6.5 rounded-lg text-muted-foreground hover:text-foreground font-semibold hover:bg-muted gap-1 px-1.5 text-[9px] sm:text-[10px]"
                          onClick={() => handleDownloadCV(app)}
                        >
                          <FileText className="h-3 w-3" />
                          <span>Get CV</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Quick Recruitment Actions (Quick Review equivalent) */}
        {/* Quick Recruitment Actions (Quick Review equivalent) */}
        <Card className="rounded-2xl border border-border bg-card p-4 sm:p-5 lg:p-3 xl:p-4 2xl:p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-sm sm:text-base font-semibold text-foreground">Quick Recruiting</CardTitle>
            <CardDescription className="text-[10px] sm:text-[11px] text-muted-foreground">
              Post roles and review your funnel instantly.
            </CardDescription>
          </div>

          {/* Search box inside container */}
          <div className="relative mt-2">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search candidate pool..." 
              className="w-full h-7 pl-7 pr-2 rounded-lg border border-input bg-card text-[11px] text-foreground outline-none focus:border-ring transition"
            />
          </div>

          <span className="text-[8px] sm:text-[9px] text-muted-foreground mt-1.5 font-bold tracking-tight block">
            Recent: Data Science Internship Postings
          </span>

          {/* Selector icons row matching Quick Review */}
          <div className="flex items-center justify-between gap-1 sm:gap-1.5 lg:gap-0.5 xl:gap-1 py-2 border-y border-border my-2">
            {[
              { icon: TrendingUp, label: "Analytics", path: "/companydashboard/analytics" },
              { icon: Layers, label: "Tracking", path: "/companydashboard/TrackInternships" },
              { icon: Briefcase, label: "Positions", path: "/companydashboard/listings" },
              { icon: Users, label: "Talent", path: "/companydashboard/applications" },
              { icon: FileText, label: "CV Vault", path: "/companydashboard/applications" }
            ].map((tool, index) => {
              const IconComp = tool.icon;
              return (
                <div key={index} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => navigate(tool.path)}
                    className="h-7.5 w-7.5 sm:h-8 sm:w-8 lg:h-7 lg:w-7 xl:h-8 xl:w-8 rounded-lg border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted shadow-sm transition-colors"
                  >
                    <IconComp className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-2.5 lg:w-2.5 xl:h-3.5 xl:w-3.5" />
                  </Button>
                  <span className="text-[8px] sm:text-[9px] lg:text-[7.5px] xl:text-[9px] font-semibold text-muted-foreground tracking-tight lg:tracking-[-0.05em] xl:tracking-tight text-center truncate w-full">
                    {tool.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bottom Action buttons matching Practice / Start Quiz */}
          <div className="flex items-center gap-1.5 w-full pt-1">
            <Button 
              variant="outline" 
              className="flex-1 h-7.5 rounded-xl bg-muted/50 border-border text-[9px] sm:text-[10px] font-bold text-foreground hover:bg-muted"
              onClick={() => navigate("/companydashboard/listings")}
            >
              Manage Postings
            </Button>
            <Button 
              className="flex-1 h-7.5 rounded-xl bg-primary text-[9px] sm:text-[10px] font-bold text-primary-foreground hover:bg-primary/95 gap-1 shadow-sm"
              onClick={openModal}
            >
              <span>Post Offer</span>
              <Plus className="h-2.5 w-2.5" />
            </Button>
          </div>
        </Card>

      </div>
      
    </div>
  );
}
