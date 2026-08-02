import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Stepper } from "@/components/ui/stepper";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { Briefcase, FileText, Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";


export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, entriesPerPage]);

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const offer = app.offer || app.offer_title || app.internship_title || (app.internship ? `Internship #${app.internship}` : "");
      const matchesSearch = offer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const statusRaw = String(app.status || "").trim().toUpperCase();
      let normalizedStatus = statusRaw;
      if (app.is_validated_by_admin || statusRaw === "VALIDATED" || statusRaw === "COMPLETE") {
        normalizedStatus = "VALIDATED";
      }
      
      const matchesStatus = statusFilter === "All" || normalizedStatus === statusFilter.toUpperCase();
      
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredApplications.length / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + entriesPerPage);



  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] w-full">
        <LoadingScreen fullScreen={false} />
      </div>
    );
  }


  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 animate-in fade-in duration-500 bg-background text-foreground">

      {/* 1. TOP HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-1">
        <div className="flex flex-col">
          <h1 className="text-[18px] sm:text-[20px] font-bold text-foreground leading-tight">My Applications</h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
            Track the internships you applied for.
          </p>
        </div>
      </div>

      {/* 2. TABLE CARD */}
      <Card className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-foreground" />
            <CardTitle className="text-sm sm:text-base font-semibold text-foreground">Recent Applications</CardTitle>
          </div>
          
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search offer..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-7 w-32 sm:w-40 pl-7 pr-2 rounded-lg border border-input bg-card text-[11px] text-foreground placeholder:text-muted-foreground outline-none focus:border-ring transition"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 rounded-lg bg-card border-border text-[10px] sm:text-[11px] font-semibold gap-1 text-muted-foreground hover:text-foreground px-2">
                  <SlidersHorizontal className="h-3 w-3" />
                  <span>Filter: {statusFilter}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 bg-card border-border text-foreground">
                {["All", "Pending", "Accepted", "Rejected", "Validated", "Cancelled"].map(status => (
                  <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)}>
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="w-full rounded-lg border border-border overflow-visible mt-2">
          {error ? (
            <p className="text-sm text-destructive py-4 text-center">{error}</p>
          ) : filteredApplications.length === 0 ? (
            <p className="text-[11px] text-muted-foreground text-center py-6">No applications match your filters.</p>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium text-[11px] py-2 pl-3">Offer</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-[11px] py-2 w-[360px]">Status</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-[11px] py-2 w-[180px]">Applied Date</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-[11px] py-2 text-center w-[130px]">Agreement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedApplications.map((application) => {
                  const offer =
                    application.offer ||
                    application.offer_title ||
                    application.internship_title ||
                    (application.internship ? `Internship #${application.internship}` : "-");

                  const statusRaw = String(application.status || "").trim().toUpperCase();
                  const agreementReady =
                    application.is_validated_by_admin ||
                    statusRaw === "VALIDATED" ||
                    statusRaw === "COMPLETE";
                  const appliedDate = application.appliedDate || application.application_date || "-";
                  const offerId = application.internship;
                  const isAdminRejected = statusRaw === "REJECTED" && !!application.admin_rejection_date;

                  let currentStep = 2;
                  if (statusRaw === "ACCEPTED") currentStep = 3;
                  if (statusRaw === "VALIDATED" || statusRaw === "COMPLETE" || application.is_validated_by_admin) currentStep = 4;
                  if (statusRaw === "REJECTED" || statusRaw === "CANCELLED") {
                    currentStep = isAdminRejected ? 3 : 2;
                  }

                  return (
                    <TableRow key={application.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <TableCell className="py-2 pl-3">
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full flex-shrink-0 bg-[#38bdf8]" />
                          {offerId ? (
                            <Button
                              variant="link"
                              className="p-0 h-auto font-semibold text-foreground text-xs hover:text-primary transition-colors"
                              onClick={() => navigate(`/internships/${offerId}`)}
                            >
                              {offer}
                            </Button>
                          ) : (
                            <span className="font-semibold text-foreground text-xs">{offer}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-[11px] font-medium text-muted-foreground">
                        <div className="py-1">
                          <Stepper
                            steps={[
                              { label: "Applied" },
                              { label: "Accepted" },
                              { label: "Validated" }
                            ]}
                            currentStep={currentStep}
                            status={statusRaw}
                            rejectedByAdmin={isAdminRejected}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-[11px] font-medium text-muted-foreground">{appliedDate}</TableCell>
                      <TableCell className="py-2 text-center">
                        {agreementReady && ["ACCEPTED", "VALIDATED", "COMPLETE"].includes(statusRaw) ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 font-semibold gap-1 px-2 text-[10px]"
                            onClick={async () => {
                              try {
                                const res = await api.get(`/admin/applications/${application.id}/agreement/`, {
                                  responseType: 'blob'
                                });
                                const url = window.URL.createObjectURL(new Blob([res.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', `Agreement_${application.id}.pdf`);
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                                window.URL.revokeObjectURL(url);
                              } catch (err) {
                                console.error("Failed to download agreement:", err);
                              }
                            }}
                          >
                            <FileText className="h-3 w-3" />
                            <span>Download</span>
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="h-6.5 rounded-lg text-muted-foreground bg-muted/50 font-semibold gap-1 px-2 text-[10px]"
                          >
                            <FileText className="h-3 w-3 opacity-50" />
                            <span>Pending</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
        
        {/* Pagination Footer */}
        {!error && filteredApplications.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span>Show</span>
              <select 
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                className="border border-border rounded px-1.5 py-0.5 bg-card text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring font-medium"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>per page</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="h-7 w-7 rounded disabled:opacity-30 hover:bg-muted"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-6 h-6 flex items-center justify-center rounded-md font-semibold text-xs transition-colors ${
                      currentPage === pageNum
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="h-7 w-7 rounded disabled:opacity-30 hover:bg-muted"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
