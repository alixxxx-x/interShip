import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  FileText,
  MapPin,
  Briefcase,
  ExternalLink,
  GraduationCap,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/api/api";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line } from "recharts";

export default function AdminUnivDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCompanies: 0,
    totalDepartments: 0
  });
  const [partnerCompanies, setPartnerCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const appleFont = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin-univ/dashboard/");
      setStats(res.data.stats);
      setPartnerCompanies(res.data.companies || []);
    } catch (error) {
      console.error("Failed to load admin univ dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [entriesPerPage]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-background" style={{ fontFamily: appleFont }}>
        <div className="flex justify-between items-center">
          <div className="h-8 w-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-8 w-32 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
        <div className="h-72 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  // Sparkline data
  const barData = [
    { value: 10 }, { value: 16 }, { value: 13 }, { value: 24 }, { value: 28 }
  ];
  const lineData1 = [
    { value: 8 }, { value: 15 }, { value: 11 }, { value: 18 }, { value: 25 }
  ];
  const lineData2 = [
    { value: 12 }, { value: 10 }, { value: 15 }, { value: 14 }, { value: 20 }
  ];

  const totalPages = Math.ceil(partnerCompanies.length / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedCompanies = partnerCompanies.slice(startIndex, startIndex + entriesPerPage);

  return (
    <div
      className="p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 animate-in fade-in duration-500 bg-background text-foreground"
      style={{ fontFamily: appleFont }}
    >
      {/* 1. TOP HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-1">
        <div className="flex flex-col">
          <h1 className="text-[18px] sm:text-[20px] font-bold text-foreground leading-tight">
            University Admin Dashboard
          </h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
            Monitor overall platform statistics and manage active partnerships.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-input bg-card hover:bg-muted text-[11px] font-semibold text-muted-foreground transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh Data
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-input bg-card hover:bg-muted text-[11px] font-semibold text-muted-foreground transition-colors"
          >
            <FileText className="h-3 w-3" />
            Export Report
          </button>
        </div>
      </div>

      {/* 2. HIGHLIGHTS SECTION */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-semibold text-foreground">Highlights</h2>
        </div>

        {/* HIGHLIGHTS GRID — exact same card structure as CompanyDashboard */}
        <div className="grid gap-3 sm:gap-4 lg:gap-5 grid-cols-2 lg:grid-cols-3">

          {/* Card 1: Departments */}
          <Card
            className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/adminunivdashboard/departments")}
          >
            <CardContent className="p-2 sm:p-3 md:p-3.5 lg:p-2.5 xl:p-4 2xl:p-5 flex flex-col justify-between">
              {/* Row 1: Icon + Label + Badge */}
              <div className="flex items-center gap-1.5 min-w-0">
                <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-3.5 lg:w-3.5 xl:h-4.5 xl:w-4.5 text-slate-500/80 flex-shrink-0" />
                <span className="text-[9px] sm:text-[10px] lg:text-[10px] xl:text-xs font-semibold text-slate-600 dark:text-slate-300 truncate leading-tight">Departments</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[8px] sm:text-[9px] lg:text-[8px] xl:text-[10px] px-1 sm:px-1.5 py-0.5 rounded font-semibold shadow-none flex-shrink-0 ml-auto">Active</Badge>
              </div>

              {/* Row 2: Value + Sparkline */}
              <div className="flex items-end justify-between mt-2 sm:mt-2.5 lg:mt-2.5 xl:mt-4">
                <span className="text-lg sm:text-xl lg:text-lg xl:text-2xl 2xl:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  {String(stats?.totalDepartments ?? 0).padStart(2, '0')}
                </span>
                <div className="w-10 h-5 sm:w-12 sm:h-6 lg:w-10 lg:h-5 xl:w-16 xl:h-8 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Bar dataKey="value" fill="#38bdf8" barSize={3.5} radius={[1, 1, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Partner Companies */}
          <Card
            className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/adminunivdashboard/companies")}
          >
            <CardContent className="p-2 sm:p-3 md:p-3.5 lg:p-2.5 xl:p-4 2xl:p-5 flex flex-col justify-between">
              {/* Row 1: Icon + Label + Badge */}
              <div className="flex items-center gap-1.5 min-w-0">
                <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-3.5 lg:w-3.5 xl:h-4.5 xl:w-4.5 text-slate-500/80 flex-shrink-0" />
                <span className="text-[9px] sm:text-[10px] lg:text-[10px] xl:text-xs font-semibold text-slate-600 dark:text-slate-300 truncate leading-tight">Partner Companies</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[8px] sm:text-[9px] lg:text-[8px] xl:text-[10px] px-1 sm:px-1.5 py-0.5 rounded font-semibold shadow-none flex-shrink-0 ml-auto">+5%</Badge>
              </div>

              {/* Row 2: Value + Sparkline */}
              <div className="flex items-end justify-between mt-2 sm:mt-2.5 lg:mt-2.5 xl:mt-4">
                <span className="text-lg sm:text-xl lg:text-lg xl:text-2xl 2xl:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  {String(stats?.totalCompanies ?? 0).padStart(2, '0')}
                </span>
                <div className="w-10 h-5 sm:w-12 sm:h-6 lg:w-10 lg:h-5 xl:w-16 xl:h-8 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData1} margin={{ top: 3, right: 1, left: 1, bottom: 3 }}>
                      <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Total Students */}
          <Card
            className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/adminunivdashboard/users?role=STUDENT")}
          >
            <CardContent className="p-2 sm:p-3 md:p-3.5 lg:p-2.5 xl:p-4 2xl:p-5 flex flex-col justify-between">
              {/* Row 1: Icon + Label + Badge */}
              <div className="flex items-center gap-1.5 min-w-0">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-3.5 lg:w-3.5 xl:h-4.5 xl:w-4.5 text-slate-500/80 flex-shrink-0" />
                <span className="text-[9px] sm:text-[10px] lg:text-[10px] xl:text-xs font-semibold text-slate-600 dark:text-slate-300 truncate leading-tight">Total Students</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[8px] sm:text-[9px] lg:text-[8px] xl:text-[10px] px-1 sm:px-1.5 py-0.5 rounded font-semibold shadow-none flex-shrink-0 ml-auto">+10%</Badge>
              </div>

              {/* Row 2: Value + Sparkline */}
              <div className="flex items-end justify-between mt-2 sm:mt-2.5 lg:mt-2.5 xl:mt-4">
                <span className="text-lg sm:text-xl lg:text-lg xl:text-2xl 2xl:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  {String(stats?.totalStudents ?? 0).padStart(2, '0')}
                </span>
                <div className="w-10 h-5 sm:w-12 sm:h-6 lg:w-10 lg:h-5 xl:w-16 xl:h-8 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData2} margin={{ top: 3, right: 1, left: 1, bottom: 3 }}>
                      <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* 3. PARTNER COMPANIES TABLE */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-semibold text-foreground">Active Partner Companies</h2>
          <button
            onClick={() => navigate('/adminunivdashboard/companies')}
            className="flex items-center gap-1 h-7 px-2.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors"
          >
            View All
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-visible">
          {paginatedCompanies.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center space-y-3">
              <span className="text-muted-foreground/30">
                <Building2 className="w-10 h-10 stroke-[1.5]" />
              </span>
              <span className="text-sm font-semibold text-muted-foreground">No partner companies found</span>
              <span className="text-xs text-muted-foreground/60">Registered companies will appear here when active.</span>
            </div>
          ) : (
            <div className="w-full">
              <table className="w-full table-fixed border-collapse text-left">
                <thead>
                  <tr className="bg-blue-50 dark:bg-zinc-900 border-b border-blue-100 dark:border-zinc-800">
                    <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 w-[260px]">Company</th>
                    <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 w-[180px]">Sector / Field</th>
                    <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 w-[160px]">Location</th>
                    <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 w-[120px]">Size</th>
                    <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCompanies.map((company) => (
                    <tr
                      key={company.id}
                      className="border-b border-gray-100 dark:border-zinc-800/60 last:border-b-0 hover:bg-gray-50/40 dark:hover:bg-zinc-900/35 transition-colors duration-150"
                    >
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-zinc-800 border border-indigo-100 dark:border-zinc-700 flex items-center justify-center shadow-sm shrink-0">
                            <Building2 className="w-4 h-4 text-indigo-500 dark:text-zinc-400" />
                          </div>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-[13px] font-bold text-foreground truncate">{company.name}</span>
                            <span className="text-[10px] font-medium text-muted-foreground font-mono truncate">{company.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground truncate">
                          <Briefcase className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                          {company.field}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground truncate">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                          {company.location}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          {company.size}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => navigate('/adminunivdashboard/companies')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                        >
                          Manage
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-gray-150 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <span>Show</span>
              <select 
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                className="border border-gray-255/80 dark:border-zinc-800 rounded px-1.5 py-0.5 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>Companies per page</span>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-855 rounded text-gray-400 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-6 h-6 flex items-center justify-center rounded-md font-semibold text-xs transition-colors ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white shadow-sm"
                        : "hover:bg-gray-100 dark:hover:bg-zinc-855 text-gray-600 dark:text-zinc-400"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-855 rounded text-gray-400 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
