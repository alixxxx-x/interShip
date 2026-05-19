import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Clock } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

export default function TrackInternships() {
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
        const data = Array.isArray(res.data) ? res.data : [];
        
        // Filter only validated or completed internships
        const trackingList = data.filter((app) => {
          const statusRaw = String(app.status || "").trim().toUpperCase();
          return app.is_validated_by_admin || statusRaw === "VALIDATED" || statusRaw === "COMPLETE";
        });
        
        setApplications(trackingList);
      } catch (e) {
        console.error("Failed to load applications:", e);
        setError("Failed to load your internships.");
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
          <span className="text-sm font-medium">Loading your internships...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Track Internships</h1>
          <p className="text-muted-foreground">
            Track your ongoing and completed internships.
          </p>
        </div>
      </div>

      {/* Internships Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Internships</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">You don't have any ongoing or completed internships yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Internship Name</TableHead>
                  <TableHead className="w-[180px]">Status</TableHead>
                  <TableHead className="w-[180px] text-right">Certificate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => {
                  const offer =
                    application.offer ||
                    application.offer_title ||
                    application.internship_title ||
                    (application.internship ? `Internship #${application.internship}` : "-");

                  const statusRaw = String(application.status || "").trim().toUpperCase();
                  const isCompleted = statusRaw === "COMPLETE";
                  const offerId = application.internship;

                  return (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium pr-6">
                        {offerId ? (
                          <Button
                            variant="link"
                            className="p-0 h-auto"
                            onClick={() => navigate(`/internships/${offerId}`)}
                          >
                            {offer}
                          </Button>
                        ) : (
                          offer
                        )}
                      </TableCell>
                      <TableCell>
                        {isCompleted ? (
                          <Badge variant="success" className="gap-1 bg-green-100 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3" /> Completed
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="gap-1 text-amber-700 bg-amber-50">
                            <Clock className="h-3 w-3" /> Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isCompleted && application.is_validated_by_admin && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 h-8 px-2"
                            onClick={async () => {
                              try {
                                const res = await api.get(`/admin/applications/${application.id}/certificate/`, {
                                  responseType: "blob",
                                });
                                const url = window.URL.createObjectURL(new Blob([res.data]));
                                const link = document.createElement("a");
                                link.href = url;
                                link.setAttribute("download", `Certificate_${application.id}.pdf`);
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                                window.URL.revokeObjectURL(url);
                              } catch (err) {
                                console.error("Failed to download certificate:", err);
                              }
                            }}
                          >
                            Download
                          </Button>
                        )}
                      </TableCell>
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
