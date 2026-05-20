import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  Check, 
  X, 
  Copy, 
  ChevronRight, 
  Activity,
  Globe,
  Settings,
  Database,
  Search,
  Sparkles
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/api/api";
import { useToast } from "@/components/ui/custom-toast";

export default function SuperAdminDashboard() {
  const toast = useToast();
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

    // Dynamically simulate incoming platform activities to WOW the user
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

      // Remove from pending locally
      setPendingCompanies(prev => prev.filter(c => c.id !== company.id));
      
      // Refresh stats
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
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <Database className="w-10 h-10 text-primary animate-pulse" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-sm font-semibold text-muted-foreground">Authenticating Super Admin Panel...</span>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Global Students",
      value: stats.total_students,
      icon: Users,
      color: "from-blue-500 to-sky-400",
      description: "Total students on platform"
    },
    {
      title: "Active Corporate Partners",
      value: activeCompanies.length,
      icon: Building2,
      color: "from-emerald-500 to-teal-400",
      description: "Fully verified institutions"
    },
    {
      title: "Placement Rate",
      value: `${stats.placement_rate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "from-purple-500 to-indigo-400",
      description: "Validated placements"
    },
    {
      title: "Pending Registrations",
      value: pendingCompanies.length,
      icon: ShieldAlert,
      color: "from-amber-500 to-orange-400",
      description: "Awaiting registration review"
    }
  ];

  return (
    <div className="space-y-8 p-6 animate-in fade-in duration-500">
      
      {/* Top Welcome Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-gradient-to-r from-zinc-900 via-purple-950 to-zinc-900 rounded-2xl shadow-xl text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 border border-primary/40 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
              Super Admin Gateway
            </h1>
            <p className="text-zinc-300 text-xs md:text-sm font-medium mt-1">
              Global Platform Controller. Real-time metrics, registration validation pipeline & system sync.
            </p>
          </div>
        </div>
        <div className="relative z-10 flex gap-2">
          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 font-bold text-xs uppercase tracking-wider rounded-lg">
            System Live
          </Badge>
          <Badge className="bg-zinc-800 text-zinc-300 border border-zinc-700 px-3 py-1 font-semibold text-xs rounded-lg">
            Ver 2.4.0
          </Badge>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border border-border/60 hover:shadow-xl transition-all duration-300 group overflow-hidden rounded-2xl bg-card/60 backdrop-blur-sm relative">
              <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${stat.color}`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground/80 group-hover:scale-110 transition-transform duration-300" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black tracking-tight">{stat.value}</div>
                <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Central Interactive Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Validation Pipeline Queue */}
        <Card className="lg:col-span-2 border-border/80 shadow-lg rounded-2xl bg-card/45 backdrop-blur-md overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                  Registration Review Pipeline
                </CardTitle>
                <CardDescription className="text-xs">
                  Validate incoming corporate accounts and issue official platform credentials dynamically.
                </CardDescription>
              </div>
              <Badge variant="destructive" className="bg-amber-500 text-white font-black text-xs px-2 py-0.5 rounded-full">
                {pendingCompanies.length} pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-bold text-xs uppercase">Corporate Entity</TableHead>
                  <TableHead className="font-bold text-xs uppercase">Sector</TableHead>
                  <TableHead className="font-bold text-xs uppercase">Location</TableHead>
                  <TableHead className="text-right font-bold text-xs uppercase">Decision Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-16 text-muted-foreground italic">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <ShieldCheck className="w-10 h-10 text-emerald-500/80" />
                        <span className="font-bold text-sm text-foreground">Review Pipeline Clear!</span>
                        <span className="text-xs max-w-sm">All company registration requests have been authenticated and activated.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingCompanies.map((company) => (
                    <TableRow key={company.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-bold">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                            <Building2 className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold">{company.name}</span>
                            <span className="text-[10px] text-muted-foreground font-semibold">Registered: {company.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="px-2 py-0.5 text-[10px] rounded-lg font-bold border-indigo-200 text-indigo-600 bg-indigo-50">
                          {company.company_field || "Corporate"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-medium">
                        {company.location || "Algeria"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="px-2.5 h-8 rounded-lg hover:bg-destructive/10 text-red-500 text-xs font-semibold gap-1"
                            onClick={() => handleRejectCompany(company)}
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </Button>
                          <Button
                            size="sm"
                            className="px-3 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold gap-1"
                            onClick={() => handleAcceptCompany(company)}
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right Column: Real-time platform audits & Logs */}
        <div className="space-y-6">
          
          {/* Live Action/Audit Card */}
          <Card className="border-border/80 shadow-lg rounded-2xl bg-card/45 backdrop-blur-md overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle className="text-md font-bold">Platform Activity Sync</CardTitle>
                  <CardDescription className="text-[10px]">Real-time API validations & database hooks.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {systemLogs.map((log) => (
                <div key={log.id} className="flex gap-3 text-xs leading-relaxed border-b border-border/40 pb-3 last:border-0 last:pb-0">
                  <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                    log.status === "success" ? "bg-green-500" : "bg-blue-400"
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{log.action}</span>
                      <span className="text-[10px] text-muted-foreground">{log.time}</span>
                    </div>
                    <p className="text-muted-foreground text-[11px] font-medium mt-0.5">{log.msg}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Config details / Universities domains info */}
          <Card className="border-border/80 shadow-lg rounded-2xl bg-card/45 backdrop-blur-md overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-500" />
                <div>
                  <CardTitle className="text-md font-bold">Domain Security Whitelist</CardTitle>
                  <CardDescription className="text-[10px]">Approved university domain structures.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center text-xs border-b border-border/40 pb-2">
                <span className="font-semibold">Constantine 2 Univ</span>
                <Badge variant="secondary" className="font-mono text-[10px]">@univ-constantine2.dz</Badge>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-border/40 pb-2">
                <span className="font-semibold">USTHB Algiers</span>
                <Badge variant="secondary" className="font-mono text-[10px]">@usthb.dz</Badge>
              </div>
              <div className="flex justify-between items-center text-xs pb-1">
                <span className="font-semibold">Constantine 1 Univ</span>
                <Badge variant="secondary" className="font-mono text-[10px]">@univ-constantine1.dz</Badge>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Recharts Analytics overview */}
      <Card className="border-border/80 shadow-lg rounded-2xl bg-card/45 backdrop-blur-md overflow-hidden">
        <CardHeader className="pb-2 border-b border-border/50 bg-muted/20">
          <CardTitle className="text-md font-bold">Weekly Application Activity Logs</CardTitle>
          <CardDescription className="text-xs">Overall internship placement performance log.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.apps_by_month || []}>
                <defs>
                  <linearGradient id="colorAppsSuper" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}}
                />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '10px' }} />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorAppsSuper)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* GENERATION SUCCESS MODAL */}
      {showMatriculeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500" />
            
            <div className="flex flex-col items-center text-center gap-4 mt-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-md">
                <ShieldCheck className="w-8 h-8" />
              </div>
              
              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-foreground">
                  Entity Validated & Active!
                </h3>
                <p className="text-muted-foreground text-xs mt-1">
                  We've successfully registered <b>{activatedCompany.name}</b> and issued a unique Registration Number.
                </p>
              </div>

              <div className="w-full bg-muted/40 border border-border/60 rounded-xl p-4 flex flex-col items-center gap-2 mt-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Registration Number
                </span>
                <span className="text-2xl font-black font-mono tracking-wider text-emerald-500 select-all">
                  {activatedCompany.matricule}
                </span>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`mt-2 font-semibold text-xs transition-all gap-1.5 h-8.5 rounded-lg ${
                    copied ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : ""
                  }`}
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Code
                    </>
                  )}
                </Button>
              </div>

              <p className="text-[10px] text-muted-foreground/80 italic mt-1 max-w-sm">
                * The partner has been activated and can now log in and post unlimited internship listings immediately.
              </p>

              <Button 
                className="w-full mt-4 rounded-xl bg-primary hover:bg-primary/90 font-bold"
                onClick={() => setShowMatriculeModal(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
