import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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


export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/applications/");
        setApplications(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Failed to load applications:", e);
        setError("Failed to load your applications.");
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);



  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading your applications...</span>
        </div>
      </div>
    );
  }


  const getStatusBadge = (status) => {
    const normalized = String(status || "")
      .trim()
      .toLowerCase();

    const variants = {
      "In progress": "purple",
      "Accepted": "success",
      "Rejected": "destructive",
      pending: "purple",
      accepted: "success",
      rejected: "destructive",
    };

    return variants[status] || variants[normalized] || "outline";
  };

  return (
    <div className="space-y-6 p-6">

    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground">
          Track the internships you applied for.
        </p>
      </div>
    </div>
    
      {/* Recent Applications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <p className="text-sm text-muted-foreground">
                You latest applications you applied for
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">You don't have applications yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Offer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => {
                  const offer =
                    application.offer ||
                    application.offer_title ||
                    application.internship_title ||
                    (application.internship ? `Internship #${application.internship}` : "-");

                  const statusText = application.statusLabel || application.status || "-";
                  const appliedDate = application.appliedDate || application.application_date || "-";

                  return (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{offer}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(statusText)}>{statusText}</Badge>
                      </TableCell>
                      <TableCell>{appliedDate}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}