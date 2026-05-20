import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";
import api from "@/api/api";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, GraduationCap, FileText, ChevronDown } from "lucide-react";

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/admin/dashboard/stats/");
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-background">
        <div className="flex justify-between items-center">
          <div className="h-10 w-64 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-96 bg-muted animate-pulse rounded-xl" />
          <div className="h-96 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  const chartData = [
    { name: "Placed", value: data.placed_students, fill: "#10b981" },
    { name: "Unplaced", value: data.unplaced_students, fill: "#f59e0b" },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 animate-in fade-in duration-500 bg-background text-foreground">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-1">
        <div className="flex flex-col">
          <h1 className="text-[18px] sm:text-[20px] font-bold text-foreground leading-tight">Platform Analytics</h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
            Detailed metrics on student placement and platform growth.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <Button variant="outline" onClick={() => window.print()} className="h-8.5 rounded-xl bg-card border-border hover:bg-muted transition-colors text-xs font-semibold px-4 shadow-sm">
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:gap-6 md:grid-cols-2">
        {/* Placement Distribution Chart */}
        <Card className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm h-full flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
            <div className="space-y-0.5">
              <CardTitle className="text-sm sm:text-base font-semibold text-foreground">Placement Distribution</CardTitle>
              <CardDescription className="text-[10px] sm:text-[11px] text-muted-foreground">
                Comparing placed versus unplaced students.
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="h-7 rounded-lg bg-muted/50 border-border text-[10px] sm:text-[11px] font-semibold gap-1 text-foreground hover:bg-muted px-2">
                <span>All Time</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
          </div>

          <div className="h-[250px] w-full pt-4 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card rounded-xl border border-border p-2.5 shadow-lg flex flex-col space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground">{payload[0].payload.name}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-foreground">{payload[0].value} students</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Key Metrics */}
        <Card className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm h-full flex flex-col">
          <div className="flex flex-col gap-1 pb-4">
            <CardTitle className="text-sm sm:text-base font-semibold text-foreground">Key Metrics</CardTitle>
            <CardDescription className="text-[10px] sm:text-[11px] text-muted-foreground">
              Overall success and active placement stats.
            </CardDescription>
          </div>
          
          <CardContent className="p-0 flex flex-col justify-between flex-1 space-y-6">
            
            {/* Main Progress Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-muted/20 border border-border">
              <div className="flex items-center justify-between mb-3 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-foreground font-semibold">Placement Rate</span>
                </div>
                <span className="font-bold text-emerald-500 text-lg">{data.placement_rate.toFixed(1)}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000" 
                  style={{ width: `${data.placement_rate}%` }} 
                />
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
               
               <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Users className="h-4 w-4 text-slate-500/80" />
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300">Total Students</span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                    {data.total_students}
                  </span>
               </div>
               
               <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 mb-3">
                    <GraduationCap className="h-4 w-4 text-emerald-500/80" />
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300">Active Placements</span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                    {data.placed_students}
                  </span>
               </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
