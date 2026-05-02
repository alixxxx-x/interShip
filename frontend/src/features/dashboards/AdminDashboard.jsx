import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertCircle
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

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_students: 0,
    placed_students: 0,
    unplaced_students: 0,
    placement_rate: 0
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
      alert("Application validated successfully!");
      fetchDashboardData();
    } catch (error) {
      console.error("Validation failed:", error);
      alert("Failed to validate application.");
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
      alert("Could not download agreement. Ensure it is validated.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats.total_students,
      icon: Users,
      change: "Active in system",
      description: "Total students registered"
    },
    {
      title: "Placed Students",
      value: stats.placed_students,
      icon: TrendingUp,
      change: `${stats.placement_rate.toFixed(1)}%`,
      description: "Validated internships"
    },
    {
      title: "Unplaced Students",
      value: stats.unplaced_students,
      icon: AlertCircle,
      change: "Action required",
      description: "Looking for internships"
    },
    {
      title: "Pending Validations",
      value: pendingValidations.length,
      icon: Clock,
      change: "Immediate",
      description: "Requiring admin approval"
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor placements and validate internship agreements.
          </p>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <FileText className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Application Activity</CardTitle>
            <p className="text-sm text-muted-foreground">Monthly application trends for the current year</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.apps_by_month || []}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorApps)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Placement Overview</CardTitle>
            <p className="text-sm text-muted-foreground">Real-time success metrics</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Placed Students</span>
                  <span className="font-bold">{stats.placed_students}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000" 
                    style={{ width: `${stats.placement_rate}%` }} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Unplaced Students</span>
                  <span className="font-bold">{stats.unplaced_students}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-1000" 
                    style={{ width: `${100 - stats.placement_rate}%` }} 
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-2xl">
                  <span className="text-3xl font-black text-primary">{stats.placement_rate.toFixed(1)}%</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-primary/60 mt-1">Total Success Rate</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Pending Validations List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Validation Queue</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review and validate accepted internship applications
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Internship</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingValidations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground italic">
                    No applications waiting for validation.
                  </TableCell>
                </TableRow>
              ) : (
                pendingValidations.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium text-sm">
                      {app.candidate}
                    </TableCell>
                    <TableCell className="text-sm">{app.company_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{app.offer}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        onClick={() => handleValidate(app.id)}
                        className="shadow-sm hover:shadow-md transition-shadow"
                      >
                        Validate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}