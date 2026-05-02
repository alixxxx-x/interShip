import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const data = [
  { name: "Mon", views: 400 },
  { name: "Tue", views: 300 },
  { name: "Wed", views: 200 },
  { name: "Thu", views: 278 },
  { name: "Fri", views: 189 },
];

export default function CompanyAnalytics() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Detailed metrics on your internship listings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Internship Views</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
