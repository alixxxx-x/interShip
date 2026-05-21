import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Clock, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  FileText,
  AlertCircle,
  RefreshCw,
  Search,
  ChevronDown,
  CheckCircle2,
  GraduationCap,
  Bell,
  SlidersHorizontal,
  ArrowUpDown
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

export default function AdminDeptDashboard() {
  const toast = useToast();
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    total_students: 0,
    placed_students: 0,
    unplaced_students: 0,
    placement_rate: 0,
    university_name: "",
    department_name: ""
  });
  const [pendingValidations, setPendingValidations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log("Fetching admin dashboard data...");
      const [statsRes, pendingRes] = await Promise.all([
        api.get("/admin/dashboard/stats/"),
        api.get("/admin/applications/pending-validation/")
      ]);
      
      console.log("Stats received:", statsRes.data);
      console.log("Pending validations received:", pendingRes.data);
      
      setStats(statsRes.data);
      setPendingValidations(pendingRes.data.results || pendingRes.data);
    } catch (error) {
      console.error("Failed to load admin dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleValidate = async (id) => {
    if (!window.confirm("Are you sure you want to validate this internship agreement?")) return;
    try {
      await api.post(`/admin/applications/${id}/validate/`);
      toast.success("Application validated successfully!");
      fetchDashboardData();
    } catch (error) {
      console.error("Validation failed:", error);
      toast.error("Failed to validate application.");
    }
  };

  const handleDownloadAgreement = async (id) => {
    try {
      const response = await api.get(`/admin/applications/${id}/agreement/`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `agreement_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Could not download agreement. Ensure it is validated.");
    }
  };

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

  const barData = [{ value: 10 }, { value: 16 }, { value: 13 }, { value: 24 }, { value: 28 }];
  const lineData1 = [{ value: 8 }, { value: 15 }, { value: 11 }, { value: 18 }, { value: 25 }];
  
  const total = stats.placed_students + stats.unplaced_students || 1;
  const placedPct = Math.round((stats.placed_students / total) * 100);
  const unplacedPct = 100 - placedPct;

  const pieData = [
    { name: "Placed", value: placedPct, count: stats.placed_students, color: "#10b981" },
    { name: "Unplaced", value: unplacedPct, count: stats.unplaced_students, color: "#f59e0b" },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 animate-in fade-in duration-500 bg-background text-foreground">
      {/* 1. TOP HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-1">
        <div className="flex flex-col">
          {stats.university_name && (
            <span className="text-[11px] font-semibold text-muted-foreground/75 dark:text-zinc-500 mb-0.5 select-none">
              {stats.university_name} {stats.department_name ? `• ${stats.department_name}` : ""}
            </span>
          )}
          <h1 className="text-[18px] sm:text-[20px] font-bold text-foreground leading-tight">Department Overview</h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
            Monitor placements and validate internship agreements.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <Button variant="outline" onClick={() => window.print()} className="h-8.5 rounded-xl bg-card border-border hover:bg-muted transition-colors text-xs font-semibold px-4 shadow-sm">
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            Export Report
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

        {/* HIGHLIGHTS GRID */}
        <div className="grid gap-3 sm:gap-4 lg:gap-5 grid-cols-2 lg:grid-cols-4">
          
          {/* Card 1 */}
          <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 lg:p-4 flex flex-col justify-between h-full">
              <div className="flex items-center gap-1.5 min-w-0">
                <Users className="h-4 w-4 text-slate-500/80 flex-shrink-0" />
                <span className="text-[10px] xl:text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">Total Students</span>
              </div>
              <div className="flex items-end justify-between mt-3">
                <span className="text-2xl xl:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  {stats.total_students}
                </span>
                <div className="w-12 h-6 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Bar dataKey="value" fill="#38bdf8" barSize={3.5} radius={[1, 1, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2 */}
          <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 lg:p-4 flex flex-col justify-between h-full">
              <div className="flex items-center gap-1.5 min-w-0">
                <GraduationCap className="h-4 w-4 text-emerald-500/80 flex-shrink-0" />
                <span className="text-[10px] xl:text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">Placed Students</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[9px] px-1.5 py-0.5 rounded font-semibold shadow-none ml-auto">
                  {stats.placement_rate.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-end justify-between mt-3">
                <span className="text-2xl xl:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  {stats.placed_students}
                </span>
                <div className="w-12 h-6 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData1} margin={{ top: 3, right: 1, left: 1, bottom: 3 }}>
                      <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 lg:p-4 flex flex-col justify-between h-full">
              <div className="flex items-center gap-1.5 min-w-0">
                <AlertCircle className="h-4 w-4 text-amber-500/80 flex-shrink-0" />
                <span className="text-[10px] xl:text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">Unplaced</span>
              </div>
              <div className="flex items-end justify-between mt-3">
                <span className="text-2xl xl:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  {stats.unplaced_students}
                </span>
                <div className="w-12 h-6 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData1} margin={{ top: 3, right: 1, left: 1, bottom: 3 }}>
                      <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4 */}
          <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 lg:p-4 flex flex-col justify-between h-full">
              <div className="flex items-center gap-1.5 min-w-0">
                <Clock className="h-4 w-4 text-rose-500/80 flex-shrink-0" />
                <span className="text-[10px] xl:text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">Pending</span>
              </div>
              <div className="flex items-end justify-between mt-3">
                <span className="text-2xl xl:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  {pendingValidations.length}
                </span>
                <div className="w-12 h-6 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Bar dataKey="value" fill="#ef4444" barSize={3.5} radius={[1, 1, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* 3. MIDDLE ROW */}
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-3 items-start">
        
        {/* Trend Chart (2/3) */}
        <Card className="lg:col-span-2 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
            <div className="space-y-0.5">
              <CardTitle className="text-sm sm:text-base font-semibold text-foreground">Application Activity</CardTitle>
              <CardDescription className="text-[10px] sm:text-[11px] text-muted-foreground">
                Monthly application trends for the current year.
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="h-7 rounded-lg bg-muted/50 border-border text-[10px] sm:text-[11px] font-semibold gap-1 text-foreground hover:bg-muted px-2">
                <span>All Time</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
          </div>

          <div className="h-[180px] sm:h-[210px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.apps_by_month || []} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card rounded-xl border border-border p-2.5 shadow-lg flex flex-col space-y-1">
                          <span className="text-[9px] font-bold text-muted-foreground">{payload[0].payload.month}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-foreground">{payload[0].value} apps</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#38bdf8" 
                  strokeWidth={2}
                  fill="url(#colorVelocity)" 
                  activeDot={{ r: 5, stroke: '#38bdf8', strokeWidth: 1.5, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Donut Chart Card (1/3) */}
        <Card className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1 min-w-0">
              <TrendingUp className="h-4 w-4 text-foreground flex-shrink-0" />
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground truncate">Placement Overview</CardTitle>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg text-muted-foreground hover:text-foreground">
              <Search className="h-3 w-3" />
            </Button>
          </div>

          <div className="relative flex items-center justify-center h-[120px] sm:h-[135px] my-1">
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
                <text x="50%" y="43%" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: "Inter, sans-serif", fontSize: "8px", fontWeight: 500, fill: "hsl(var(--muted-foreground))", letterSpacing: "0.05em" }}>
                  Students
                </text>
                <text x="50%" y="59%" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", fontWeight: 700, fill: "hsl(var(--foreground))" }}>
                  {stats.total_students}
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1.5 mt-1 text-xs font-medium">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-border bg-muted/20">
                <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate text-muted-foreground w-full">{item.name}: <span className="font-bold text-foreground">{item.value}%</span></span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 4. BOTTOM ROW - Validation Queue */}
      <Card className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-foreground" />
            <CardTitle className="text-sm sm:text-base font-semibold text-foreground">Validation Queue</CardTitle>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search pending..." 
                className="h-7 w-32 sm:w-40 pl-7 pr-2 rounded-lg border border-input bg-card text-[11px] text-foreground placeholder:text-muted-foreground outline-none focus:border-ring transition"
              />
            </div>
          </div>
        </div>

        <div className="w-full rounded-lg border border-border overflow-visible">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-medium text-[11px] py-2 pl-3">Candidate</TableHead>
                <TableHead className="text-muted-foreground font-medium text-[11px] py-2">Company</TableHead>
                <TableHead className="text-muted-foreground font-medium text-[11px] py-2">Internship</TableHead>
                <TableHead className="text-muted-foreground font-medium text-[11px] py-2 text-right pr-3">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingValidations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-[11px] text-muted-foreground">
                    No applications waiting for validation.
                  </TableCell>
                </TableRow>
              ) : (
                pendingValidations.map((app, idx) => (
                  <TableRow key={app.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <TableCell className="py-2 pl-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${idx % 2 === 0 ? "bg-[#38bdf8]" : "bg-[#2563eb]"}`} />
                        <span className="font-semibold text-foreground text-xs">{app.candidate}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-[11px] font-medium text-muted-foreground">
                      {app.company_name}
                    </TableCell>
                    <TableCell className="py-2 text-[11px] font-medium text-muted-foreground">
                      {app.offer}
                    </TableCell>
                    <TableCell className="py-2 text-right pr-3">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 font-semibold gap-1 px-2 text-[10px]"
                        onClick={() => handleValidate(app.id)}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Validate</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
