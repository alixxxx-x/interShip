import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import api from "@/api/api";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function CompanyAnalytics() {
  const [selectedMonth, setSelectedMonth] = useState(() => months[new Date().getMonth()]);
  const [selectedPosting, setSelectedPosting] = useState("all");
  const [postings, setPostings] = useState([]);
  const [flowTrendData, setFlowTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = async (monthVal = selectedMonth, postingVal = selectedPosting) => {
    try {
      setLoading(true);
      const res = await api.get(`/company/dashboard/?month=${monthVal}&internship_id=${postingVal}`);
      
      const nextPostings = Array.isArray(res?.data?.postings) ? res.data.postings : [];
      const nextVelocity = Array.isArray(res?.data?.velocity) ? res.data.velocity : [];
      
      setPostings(nextPostings);
      setFlowTrendData(nextVelocity);
    } catch (error) {
      console.error("Failed to load analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData(selectedMonth, selectedPosting);
  }, [selectedMonth, selectedPosting]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Detailed metrics on your internship listings.</p>
      </div>

      <Card className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border">
          <div className="space-y-0.5">
            <CardTitle className="text-sm sm:text-base font-semibold text-foreground">Application Velocity</CardTitle>
            <CardDescription className="text-[10px] sm:text-[11px] text-muted-foreground">
              Your candidate sourcing trends and views activity.
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 rounded-lg bg-muted/50 border-border text-xs font-semibold gap-1 text-foreground hover:bg-muted px-3">
                  <span>{selectedPosting === "all" ? "All Postings" : postings.find(p => String(p.id) === String(selectedPosting))?.title || "All Postings"}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-border text-foreground">
                <DropdownMenuItem onClick={() => setSelectedPosting("all")}>
                  All Postings
                </DropdownMenuItem>
                {postings.map(posting => (
                  <DropdownMenuItem key={posting.id} onClick={() => setSelectedPosting(String(posting.id))}>
                    {posting.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 rounded-lg bg-muted/50 border-border text-xs font-semibold gap-1 text-foreground hover:bg-muted px-3">
                  <span>{selectedMonth}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto w-32 bg-card border-border text-foreground">
                {months.map(m => (
                  <DropdownMenuItem key={m} onClick={() => setSelectedMonth(m)}>
                    {m}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardContent className="p-4 sm:p-5">
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={flowTrendData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card rounded-xl border border-border p-3 shadow-lg flex flex-col space-y-1">
                            <span className="text-xs font-bold text-muted-foreground">
                              {selectedMonth} {payload[0].payload.name}, {new Date().getFullYear()}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]" />
                              <span className="text-sm font-black text-foreground">
                                {payload[0].value} <span className="font-semibold text-muted-foreground ml-0.5">Apps</span>
                              </span>
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
                    stroke="#0ea5e9"
                    strokeWidth={2.5}
                    fill="url(#colorVelocityAnalytics)"
                    fillOpacity={1}
                    activeDot={{ r: 5, fill: "#0ea5e9", stroke: "#fff", strokeWidth: 2 }}
                  />
                  <defs>
                    <linearGradient id="colorVelocityAnalytics" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
