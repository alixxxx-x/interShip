import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";
import api from "@/api/api";

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

  if (loading) return <div className="p-6 text-center">Gathering intelligence...</div>;

  const chartData = [
    { name: "Placed", value: data.placed_students },
    { name: "Unplaced", value: data.unplaced_students },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="text-muted-foreground">Detailed metrics on student placement and platform growth.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Placement Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
               <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Placement Rate</span>
                  <span className="text-sm font-bold">{data.placement_rate.toFixed(1)}%</span>
               </div>
               <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${data.placement_rate}%` }} />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 rounded-xl bg-slate-50">
                  <p className="text-xs text-muted-foreground font-medium uppercase">Total Students</p>
                  <p className="text-2xl font-bold">{data.total_students}</p>
               </div>
               <div className="p-4 rounded-xl bg-slate-50">
                  <p className="text-xs text-muted-foreground font-medium uppercase">Active Placements</p>
                  <p className="text-2xl font-bold">{data.placed_students}</p>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
