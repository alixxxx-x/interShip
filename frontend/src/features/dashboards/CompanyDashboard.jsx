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
  MoreHorizontal
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


export default function CompanyDashboard() {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        //Replace with actual Django API calls
        
        //replace with real API responses
        const mockStats = {
          totalInternships: 12,
          activeApplications: 48,
          totalViews: 1234,
          pendingReviews: 5,
          revenueChange: "+12.5%",
          applicationsChange: "+8.2%",
          viewsChange: "+15.3%",
          reviewsChange: "-2.1%"
        };

        const mockApplications = [
          {
            id: 1,
            candidate: "Sarah Johnson",
            status: "Rejected",
            appliedDate: "2026-04-15",
            email: "sarah.j@email.com"
          },
          {
            id: 2,
            candidate: "Michael Chen",
            status: "In progress",
            appliedDate: "2026-04-14",
            email: "m.chen@email.com"
          },
          {
            id: 3,
            candidate: "Emma Williams",
            status: "Accepted",
            appliedDate: "2026-04-14",
            email: "emma.w@email.com"
          },
          {
            id: 4,
            candidate: "James Brown",
            status: "Accepted",
            appliedDate: "2026-04-12",
            email: "james.b@email.com"
          },
          {
            id: 5,
            candidate: "Lisa Anderson",
            status: "In progress",
            appliedDate: "2026-04-11",
            email: "lisa.a@email.com"
          }
        ];

        const mockChartData = [
          { date: "Apr 12", applications: 12, views: 145 },
          { date: "Apr 13", applications: 18, views: 198 },
          { date: "Apr 14", applications: 15, views: 167 },
          { date: "Apr 15", applications: 22, views: 234 },
          { date: "Apr 16", applications: 28, views: 289 },
          { date: "Apr 17", applications: 25, views: 256 },
          { date: "Apr 18", applications: 32, views: 312 },
        ];

        setStats(mockStats);
        setApplications(mockApplications);
        setChartData(mockChartData);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Active Applications",
      value: stats?.activeApplications,
      icon: Users,
      change: stats?.applicationsChange,
      description: "New applications this week"
    },
    {
      title: "Total Views",
      value: stats?.totalViews?.toLocaleString(),
      icon: TrendingUp,
      change: stats?.viewsChange,
      description: "Internship views this month"
    },
    {
      title: "Total Internships",
      value: stats?.totalInternships,
      icon: Briefcase,
      change: "+2",
      description: "Active positions"
    },
    {
      title: "Pending Reviews",
      value: stats?.pendingReviews,
      icon: Clock,
      change: stats?.reviewsChange,
      description: "Applications to review"
    }
  ];

  const getStatusBadge = (status) => {
    const variants = {
      "New": "default",
      "In Review": "secondary",
      "Interview Scheduled": "outline",
      "Accepted": "success",
      "Rejected": "destructive"
    };
    return variants[status] || "default";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your internships.
          </p>
        </div>
        <Button onClick={() => navigate("/companydashboard/post-internship")}>
          <Plus className="mr-2 h-4 w-4" />
          Quick Add
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change?.toString().includes("+");
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
                <div className="flex items-center gap-1 mt-1">
                  {isPositive ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  )}
                  <p className={`text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}>
                    {stat.change}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Application Activity</CardTitle>
              <p className="text-sm text-muted-foreground">
                Applications and views over the last 7 days
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Last 7 days</Button>
              <Button variant="ghost" size="sm">Last 30 days</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorApplications)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Applications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest candidates who applied to your internships
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/companydashboard/applications")}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.candidate}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(app.status)}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(app.appliedDate).toLocaleDateString()}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {app.email}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}