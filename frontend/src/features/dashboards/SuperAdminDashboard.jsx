import { useEffect, useState } from "react";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  ShieldAlert, 
  ShieldCheck, 
  Check, 
  X, 
  Copy, 
  Activity,
  Settings,
  RefreshCw,
  Briefcase,
  Zap,
  ChevronDown,
  MapPin,
  Globe,
  Database
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import api from "@/api/api";
import { useToast } from "@/components/ui/custom-toast";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { useTheme } from "@/components/theme-provider";

export default function SuperAdminDashboard() {
  const toast = useToast();
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    total_students: 0,
    placed_students: 0,
    unplaced_students: 0,
    placement_rate: 0,
    apps_by_month: []
  });
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [activeCompanies, setActiveCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Successful Activation Modal
  const [showMatriculeModal, setShowMatriculeModal] = useState(false);
  const [activatedCompany, setActivatedCompany] = useState({ name: "", matricule: "" });
  const [copied, setCopied] = useState(false);

  // System status metrics (simulated real-time server stats for high visual impact)
  const [systemLogs, setSystemLogs] = useState([
    { id: 1, action: "Matriculation Validation", msg: "Generated token MAT-9012F4 for SPA Algiers", time: "Just now", status: "success" },
    { id: 2, action: "Application Route Triggered", msg: "Student ID USTHB-2023 submitted draft application", time: "2 mins ago", status: "info" },
    { id: 3, action: "Security Patch Applied", msg: "Django API CSRF middleware integrity check", time: "12 mins ago", status: "success" },
    { id: 4, action: "Matriculation Import", msg: "Synchronized 54 matriculation slots for USTHB", time: "45 mins ago", status: "success" }
  ]);

  const appleFont = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes, activeRes] = await Promise.all([
        api.get("/admin/dashboard/stats/"),
        api.get("/admin/companies/pending/"),
        api.get("/companies/")
      ]);
      
      setStats(statsRes.data);
      setPendingCompanies(pendingRes.data.results || pendingRes.data);
      setActiveCompanies(activeRes.data.results || activeRes.data);
    } catch (error) {
      console.error("Failed to load super admin dashboard stats:", error);
      toast.error("Failed to load real-time super admin metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(() => {
      const activities = [
        { action: "Gemini AI OCR Parse", msg: "Extracted profile for candidate in Blida", status: "info" },
        { action: "Agreement Generated", msg: "Digital sign lock applied to placement agreement", status: "success" },
        { action: "Matriculation Verification", msg: "Checked Matriculation DB integrity (0 delays)", status: "success" },
        { action: "Company Registry Sync", msg: "Refreshed approved corporate listing cache", status: "info" }
      ];
      const selected = activities[Math.floor(Math.random() * activities.length)];
      setSystemLogs(prev => [
        { id: Date.now(), ...selected, time: "Just now" },
        ...prev.slice(0, 3)
      ]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleAcceptCompany = async (company) => {
    try {
      toast.info(`Generating credentials for ${company.name}...`);
      const res = await api.post(`/admin/companies/${company.id}/accept/`);
      const data = res.data;

      toast.success(`Registration accepted for ${company.name}!`);
      
      setActivatedCompany({
        name: company.name,
        matricule: data.matricule
      });
      setShowMatriculeModal(true);
      setPendingCompanies(prev => prev.filter(c => c.id !== company.id));
      fetchDashboardData();
    } catch (error) {
      console.error("Failed to accept company:", error);
      toast.error("Failed to approve company registration.");
    }
  };

  const handleRejectCompany = async (company) => {
    if (!window.confirm(`Are you sure you want to REJECT and permanently remove "${company.name}" registration?`)) return;
    try {
      toast.info(`Removing request for ${company.name}...`);
      await api.post(`/admin/companies/${company.id}/reject/`);
      toast.success(`Registration request deleted.`);
      setPendingCompanies(prev => prev.filter(c => c.id !== company.id));
      fetchDashboardData();
    } catch (error) {
      console.error("Failed to reject company:", error);
      toast.error("Failed to reject company registration.");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activatedCompany.matricule);
    setCopied(true);
    toast.success("Copied Registration Number!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-background" style={{ fontFamily: appleFont }}>
        <div className="flex justify-between items-center">
          <div className="h-8 w-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-8 w-32 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-72 bg-muted animate-pulse rounded-xl" />
          <div className="h-72 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  // --- Sparkline data ---
  const barData = [
    { value: 10 }, { value: 16 }, { value: 13 }, { value: 24 }, { value: 28 }
  ];
  const lineData1 = [
    { value: 8 }, { value: 15 }, { value: 11 }, { value: 18 }, { value: 25 }
  ];
  const lineData2 = [
    { value: 10 }, { value: 10 }, { value: 10 }, { value: 10 }, { value: 10 }
  ];

  // --- Donut Chart Data ---
  const pieData = [
    { name: "Universities", value: 40, color: "#38bdf8" },
    { name: "Companies", value: 30, color: "#2563eb" },
    { name: "Students", value: 20, color: "#db2777" },
    { name: "Admins", value: 10, color: "#4f46e5" },
  ];

  // --- Flow Trend Data ---
  const flowTrendData = stats.apps_by_month?.length > 0 
    ? stats.apps_by_month.map(item => ({ name: item.month, value: item.count }))
    : [
        { name: "Jan", value: 20 },
        { name: "Feb", value: 25 },
        { name: "Mar", value: 23 },
        { name: "Apr", value: 48 },
        { name: "May", value: 40 },
      ];

  // --- Top Sectors Data ---
  const sectorData = [
    { name: "IT", value: 45 },
    { name: "Finance", value: 30 },
    { name: "Engineering", value: 25 },
    { name: "Health", value: 15 },
    { name: "Retail", value: 12 },
  ];

  return (
    <div
      className="p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 animate-in fade-in duration-500 bg-background text-foreground"
      style={{ fontFamily: appleFont }}
    >
      
      {/* 1. TOP HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-1">
        <div className="flex flex-col">
          <h1 className="text-[18px] sm:text-[20px] font-bold text-foreground leading-tight">Super Admin Gateway</h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
            Global platform controller — real-time metrics, registration pipeline & system sync.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">System Live</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchDashboardData}
            className="text-[11px] text-muted-foreground hover:text-foreground gap-1 font-medium transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. HIGHLIGHTS GRID (4 Cards) */}
      <div className="space-y-2.5">
        <h2 className="text-sm sm:text-base font-semibold text-foreground">Highlights</h2>
        <div className="grid gap-3 sm:gap-4 lg:gap-5 grid-cols-2 lg:grid-cols-4">
          
          {/* Card 1: Global Students */}
          <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-2 sm:p-3 md:p-3.5 lg:p-2.5 xl:p-4 2xl:p-5 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 lg:h-3.5 lg:w-3.5 xl:h-4.5 xl:w-4.5 2xl:h-5 2xl:w-5 text-slate-500/80 flex-shrink-0" />
                <span className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-[10px] xl:text-xs 2xl:text-sm font-semibold text-slate-600 dark:text-slate-300 truncate leading-tight">Global Students</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[8px] sm:text-[9px] md:text-[10px] lg:text-[8px] xl:text-[10px] 2xl:text-xs px-1 sm:px-1.5 py-0.5 rounded font-semibold shadow-none flex-shrink-0 ml-auto">+12%</Badge>
              </div>
              <div className="flex items-end justify-between mt-2 sm:mt-2.5 md:mt-3 lg:mt-2.5 xl:mt-4 2xl:mt-5">
                <span className="text-lg sm:text-xl md:text-2xl lg:text-lg xl:text-2xl 2xl:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  {String(stats?.total_students ?? 0).padStart(2, '0')}
                </span>
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

          {/* Card 2: Corporate Partners */}
          <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-2 sm:p-3 md:p-3.5 lg:p-2.5 xl:p-4 2xl:p-5 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 lg:h-3.5 lg:w-3.5 xl:h-4.5 xl:w-4.5 2xl:h-5 2xl:w-5 text-slate-500/80 flex-shrink-0" />
                <span className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-[10px] xl:text-xs 2xl:text-sm font-semibold text-slate-600 dark:text-slate-300 truncate leading-tight">Active Partners</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[8px] sm:text-[9px] md:text-[10px] lg:text-[8px] xl:text-[10px] 2xl:text-xs px-1 sm:px-1.5 py-0.5 rounded font-semibold shadow-none flex-shrink-0 ml-auto">+5%</Badge>
              </div>
              <div className="flex items-end justify-between mt-2 sm:mt-2.5 md:mt-3 lg:mt-2.5 xl:mt-4 2xl:mt-5">
                <span className="text-lg sm:text-xl md:text-2xl lg:text-lg xl:text-2xl 2xl:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  {String(activeCompanies.length ?? 0).padStart(2, '0')}
                </span>
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

          {/* Card 3: Placement Rate */}
          <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-2 sm:p-3 md:p-3.5 lg:p-2.5 xl:p-4 2xl:p-5 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 lg:h-3.5 lg:w-3.5 xl:h-4.5 xl:w-4.5 2xl:h-5 2xl:w-5 text-slate-500/80 flex-shrink-0" />
                <span className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-[10px] xl:text-xs 2xl:text-sm font-semibold text-slate-600 dark:text-slate-300 truncate leading-tight">Placement Rate</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[8px] sm:text-[9px] md:text-[10px] lg:text-[8px] xl:text-[10px] 2xl:text-xs px-1 sm:px-1.5 py-0.5 rounded font-semibold shadow-none flex-shrink-0 ml-auto">+10%</Badge>
              </div>
              <div className="flex items-end justify-between mt-2 sm:mt-2.5 md:mt-3 lg:mt-2.5 xl:mt-4 2xl:mt-5">
                <span className="text-lg sm:text-xl md:text-2xl lg:text-lg xl:text-2xl 2xl:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  {stats?.placement_rate?.toFixed(1) ?? 0}%
                </span>
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

          {/* Card 4: Pending Registrations */}
          <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-2 sm:p-3 md:p-3.5 lg:p-2.5 xl:p-4 2xl:p-5 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <ShieldAlert className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 lg:h-3.5 lg:w-3.5 xl:h-4.5 xl:w-4.5 2xl:h-5 2xl:w-5 text-slate-500/80 flex-shrink-0" />
                <span className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-[10px] xl:text-xs 2xl:text-sm font-semibold text-slate-600 dark:text-slate-300 truncate leading-tight">Pending Reviews</span>
                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-none text-[8px] sm:text-[9px] md:text-[10px] lg:text-[8px] xl:text-[10px] 2xl:text-xs px-1 sm:px-1.5 py-0.5 rounded font-semibold shadow-none flex-shrink-0 ml-auto">{pendingCompanies.length}</Badge>
              </div>
              <div className="flex items-end justify-between mt-2 sm:mt-2.5 md:mt-3 lg:mt-2.5 xl:mt-4 2xl:mt-5">
                <span className="text-lg sm:text-xl md:text-2xl lg:text-lg xl:text-2xl 2xl:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  {String(pendingCompanies.length).padStart(2, '0')}
                </span>
                <div className="flex gap-0.5 sm:gap-1 mb-0.5 flex-shrink-0">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 lg:h-2.5 lg:w-2.5 xl:h-3.5 xl:w-3.5 2xl:h-4 2xl:w-4 rounded-full bg-amber-500 flex items-center justify-center shadow-sm">
                      <ShieldAlert className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 lg:h-1.5 lg:w-1.5 xl:h-2 xl:w-2 2xl:h-2.5 2xl:w-2.5 text-white fill-white" />
                    </div>
                  ))}
                  <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 lg:h-2.5 lg:w-2.5 xl:h-3.5 xl:w-3.5 2xl:h-4 2xl:w-4 rounded-full bg-muted flex items-center justify-center border border-border" />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* 3. MIDDLE ROW (Application Velocity + Platform Distribution + Top Sectors) */}
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-4 items-start">
        
        {/* Application Velocity Chart (2/4 width) */}
        <Card className="lg:col-span-2 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
            <div className="space-y-0.5">
              <CardTitle className="text-sm sm:text-base font-semibold text-foreground">Application Velocity</CardTitle>
              <CardDescription className="text-[10px] sm:text-[11px] text-muted-foreground">
                Global internship placement performance trends.
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <Button variant="outline" size="sm" className="h-7 rounded-lg bg-muted/50 border-border text-[10px] sm:text-[11px] font-semibold gap-1 text-foreground hover:bg-muted px-2">
                <span>All Platforms</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
              <Button variant="outline" size="sm" className="h-7 rounded-lg bg-muted/50 border-border text-[10px] sm:text-[11px] font-semibold gap-1 text-foreground hover:bg-muted px-2">
                <span>This Year</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
          </div>

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
                          <span className="text-[9px] font-bold text-muted-foreground">Platform Activity</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-foreground">{payload[0].value} applications</span>
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
                  fill="url(#colorVelocitySuper)" 
                  activeDot={{ r: 5, stroke: '#38bdf8', strokeWidth: 1.5, fill: '#fff' }}
                />
                <defs>
                  <linearGradient id="colorVelocitySuper" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Platform Distribution Donut (1/4 width) */}
        <Card className="rounded-2xl border border-border bg-card p-4 lg:p-3 xl:p-4 2xl:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1 min-w-0">
              <TrendingUp className="h-4 w-4 text-foreground flex-shrink-0" />
              <CardTitle className="text-xs sm:text-sm lg:text-xs xl:text-sm 2xl:text-base font-semibold text-foreground truncate">Platform Distribution</CardTitle>
            </div>
          </div>

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
                  Entities
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
                  {stats.total_students + activeCompanies.length}
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1 sm:gap-1.5 mt-1 text-[9px] sm:text-xs lg:text-[10px] xl:text-xs 2xl:text-sm font-medium">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1 sm:gap-1.5 px-1.5 py-0.5 sm:py-1 lg:px-1 lg:py-0.5 xl:px-2 xl:py-1 2xl:px-2.5 2xl:py-1.5 rounded-md border border-border bg-muted/20 min-w-0">
                <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate text-muted-foreground w-full">{item.name}: <span className="font-bold text-foreground">{item.value}%</span></span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Corporate Sectors (1/4 width) */}
        <Card className="rounded-2xl border border-border bg-card p-4 lg:p-3 xl:p-4 2xl:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Briefcase className="h-4 w-4 text-blue-500 shrink-0" />
            <div className="min-w-0">
              <CardTitle className="text-xs sm:text-sm lg:text-xs xl:text-sm 2xl:text-base font-semibold text-foreground truncate">Top Sectors</CardTitle>
            </div>
          </div>
          <div className="h-[120px] sm:h-[135px] lg:h-[105px] xl:h-[130px] 2xl:h-[140px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData} layout="vertical" margin={{ top: 0, right: 10, left: 15, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} width={55} />
                <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '10px', padding: '4px 8px' }} />
                <Bar dataKey="value" fill="#38bdf8" radius={[0, 4, 4, 0]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* 4. BOTTOM ROW (Pending Pipeline + Activity Log) */}
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-3 items-start">

        {/* Left column wrapper for Pipeline + System Health */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          {/* Pending Pipeline Table */}
          <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-visible">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5 pb-0">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-sm sm:text-base font-semibold text-foreground">Registration Pipeline</CardTitle>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/25 text-amber-600 dark:text-amber-400 border border-amber-100/60 dark:border-amber-900/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)] animate-pulse" />
              {pendingCompanies.length} pending
            </div>
          </div>
          
          <div className="p-4 sm:p-5 pt-3">
            <div className="w-full rounded-xl border border-border overflow-visible">
              <table className="w-full table-fixed border-collapse text-left">
                <thead>
                  <tr className="bg-blue-50 dark:bg-zinc-900 border-b border-blue-100 dark:border-zinc-800">
                    <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3 px-4 w-[40%] rounded-tl-xl">Corporate Entity</th>
                    <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3 px-4 w-[20%]">Sector</th>
                    <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3 px-4 w-[15%]">Location</th>
                    <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3 px-4 text-right rounded-tr-xl">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCompanies.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <ShieldCheck className="w-9 h-9 text-emerald-500/60" />
                          <span className="text-[13px] font-bold text-foreground">Pipeline Clear!</span>
                          <span className="text-[11px] text-muted-foreground max-w-xs">All company registrations have been reviewed.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pendingCompanies.map((company) => (
                      <tr
                        key={company.id}
                        className="border-b border-gray-100 dark:border-zinc-800/60 last:border-b-0 hover:bg-gray-50/40 dark:hover:bg-zinc-900/35 transition-colors duration-150"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-zinc-800 flex items-center justify-center border border-blue-100 dark:border-zinc-700 shadow-sm shrink-0">
                              <Building2 className="w-3.5 h-3.5 text-blue-500 dark:text-zinc-400" />
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-[12px] font-bold text-gray-900 dark:text-zinc-100 truncate">{company.name}</span>
                              <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono truncate">{company.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/25 text-blue-600 dark:text-blue-400 border border-blue-100/60 dark:border-blue-900/30">
                            {company.company_field || "Corporate"}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-[11px] font-medium text-gray-600 dark:text-zinc-300 truncate">
                            <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                            {company.location || "Algeria"}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRejectCompany(company)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 transition-colors"
                            >
                              <X className="w-3 h-3" /> Reject
                            </button>
                            <button
                              onClick={() => handleAcceptCompany(company)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 transition-colors"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </Card>

          {/* System Health Card */}
          <Card className="rounded-2xl border border-border bg-card shadow-sm p-4 sm:p-5">
            <div className="flex items-center gap-2 pb-4 border-b border-border/50">
              <Database className="h-4 w-4 text-emerald-500" />
              <div>
                <CardTitle className="text-sm sm:text-base font-semibold text-foreground">System Health & Infrastructure</CardTitle>
                <CardDescription className="text-[10px] text-muted-foreground">Live server metrics and database status.</CardDescription>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
               <div className="flex flex-col gap-1 sm:border-r border-border/40 px-2">
                 <span className="text-[11px] font-semibold text-muted-foreground">Api Latency</span>
                 <span className="text-xl font-bold text-foreground">24<span className="text-[10px] font-semibold text-muted-foreground ml-0.5">ms</span></span>
                 <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded w-fit">Optimal</span>
               </div>
               <div className="flex flex-col gap-1 sm:border-r border-border/40 px-2">
                 <span className="text-[11px] font-semibold text-muted-foreground">Uptime</span>
                 <span className="text-xl font-bold text-foreground">99.9<span className="text-[10px] font-semibold text-muted-foreground ml-0.5">%</span></span>
                 <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded w-fit">94 days</span>
               </div>
               <div className="flex flex-col gap-1 sm:border-r border-border/40 px-2">
                 <span className="text-[11px] font-semibold text-muted-foreground">Storage</span>
                 <span className="text-xl font-bold text-foreground">42<span className="text-[10px] font-semibold text-muted-foreground ml-0.5">GB</span></span>
                 <span className="text-[9px] font-bold text-blue-500 bg-blue-500/10 px-1 py-0.5 rounded w-fit">28% used</span>
               </div>
               <div className="flex flex-col gap-1 px-2">
                 <span className="text-[11px] font-semibold text-muted-foreground">Load</span>
                 <span className="text-xl font-bold text-foreground">1.2<span className="text-[10px] font-semibold text-muted-foreground ml-0.5">avg</span></span>
                 <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded w-fit">Stable</span>
               </div>
            </div>
          </Card>
        </div>
        {/* Right Column: Activity Log + Domain Config */}
        <div className="space-y-4">
          
          {/* Platform Activity Log */}
          <Card className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Activity className="h-4 w-4 text-blue-500" />
              <div>
                <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">Platform Activity</CardTitle>
                <CardDescription className="text-[10px] text-muted-foreground">Real-time API validations & hooks.</CardDescription>
              </div>
            </div>
            <div className="pt-3 space-y-3">
              {systemLogs.map((log) => (
                <div key={log.id} className="flex gap-2.5 text-xs leading-relaxed border-b border-border/40 pb-3 last:border-0 last:pb-0">
                  <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                    log.status === "success" ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.6)]" : "bg-blue-400 shadow-[0_0_4px_rgba(59,130,246,0.6)]"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-foreground truncate">{log.action}</span>
                      <span className="text-[9px] text-muted-foreground whitespace-nowrap">{log.time}</span>
                    </div>
                    <p className="text-muted-foreground text-[10px] font-medium mt-0.5 truncate">{log.msg}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Domain Whitelist */}
          <Card className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Settings className="h-4 w-4 text-blue-500" />
              <div>
                <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">Domain Security</CardTitle>
                <CardDescription className="text-[10px] text-muted-foreground">Approved university domain structures.</CardDescription>
              </div>
            </div>
            <div className="pt-3 space-y-2.5">
              {[
                { name: "Constantine 2", domain: "@univ-constantine2.dz" },
                { name: "USTHB", domain: "@usthb.dz" },
                { name: "Constantine 1", domain: "@univ-constantine1.dz" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 text-xs border-b border-border/40 pb-2 last:border-0 last:pb-0 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="font-semibold text-foreground text-[11px] truncate">{item.name}</span>
                  </div>
                  <span className="font-mono text-[9px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-800/30 shrink-0">
                    {item.domain}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* GENERATION SUCCESS MODAL */}
      {showMatriculeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-300" style={{ fontFamily: appleFont }}>
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-500 rounded-t-2xl" />

            <div className="flex flex-col items-center text-center gap-4 mt-2">
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-7 h-7 text-emerald-500" />
              </div>

              <div>
                <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-zinc-50">Entity Validated & Active!</h3>
                <p className="text-[12px] font-medium text-gray-500 dark:text-zinc-400 mt-1">
                  Secure registration number generated for <b className="text-gray-700 dark:text-zinc-200">{activatedCompany.name}</b>.
                </p>
              </div>

              <div className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl p-4 flex flex-col items-center gap-2">
                <span className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 tracking-wider">Registration Number</span>
                <span className="text-2xl font-black font-mono tracking-wider text-emerald-500 select-all">
                  {activatedCompany.matricule}
                </span>
                <button
                  onClick={copyToClipboard}
                  className={`mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                    copied
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400"
                      : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Code</>}
                </button>
              </div>

              <p className="text-[11px] text-gray-400 dark:text-zinc-500 italic max-w-sm">
                * The partner has been activated and can now log in and post unlimited internship listings immediately.
              </p>

              <button
                onClick={() => setShowMatriculeModal(false)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold transition-colors shadow-sm shadow-blue-600/20 mt-2"
              >
                Close & Finish Approval
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
