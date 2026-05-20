import { useEffect, useState } from "react";
import { DownloadCloud, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/api/api";
import { useToast } from "@/components/ui/custom-toast";
import LoadingScreen from "@/components/ui/LoadingScreen";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function CompanyTrackInternships() {
  const toast = useToast();
  const [applicationsByOffer, setApplicationsByOffer] = useState({});
  const [loading, setLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [internshipToStop, setInternshipToStop] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [offerFilter, setOfferFilter] = useState("ALL_OFFERS");
  const [showOfferFilter, setShowOfferFilter] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPages, setCurrentPages] = useState({});

  const appleFont = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  useEffect(() => {
    const fetchTrackedApplications = async () => {
      try {
        const response = await api.get('/applications/');
        const applications = response.data.results || response.data;

        // Filter for internships in progress, completed, or stopped
        const trackedApplications = applications.filter(app => {
          const status = String(app.status || "").trim().toUpperCase();
          return status === "VALIDATED" || status === "COMPLETE" || status === "CANCELLED" || app.is_validated_by_admin === true;
        });

        const grouped = trackedApplications.reduce((acc, app) => {
          const { offer } = app;
          if (!acc[offer]) {
            acc[offer] = [];
          }
          acc[offer].push(app);
          return acc;
        }, {});

        setApplicationsByOffer(grouped);
      } catch (error) {
        console.error("Failed to load tracked applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackedApplications();
  }, []);

  const confirmStop = (offer, id) => {
    setInternshipToStop({ offer, id });
    setIsConfirmOpen(true);
  };

  const handleStopInternship = async () => {
    if (!internshipToStop) return;
    const { offer, id } = internshipToStop;

    try {
      await api.patch(`/applications/${id}/update/`, { status: 'CANCELLED' });
      setApplicationsByOffer(prev => {
        const updatedApplications = prev[offer].map(app =>
          app.id === id ? { ...app, status: 'CANCELLED' } : app
        );
        return { ...prev, [offer]: updatedApplications };
      });
      toast.success("Internship stopped successfully.");
    } catch (error) {
      console.error("Failed to stop internship:", error);
      toast.error("Failed to stop internship.");
    } finally {
      setIsConfirmOpen(false);
      setInternshipToStop(null);
    }
  };

  const downloadCertificate = async (application) => {
    try {
      const res = await api.get(`/admin/applications/${application.id}/certificate/`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate_${application.candidate.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download certificate:", err);
      toast.error("Failed to download certificate");
    }
  };

  const getBadgeStyle = (status) => {
    const raw = String(status || "").trim().toUpperCase();
    switch (raw) {
      case "COMPLETE":
        return {
          bg: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
          dot: "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.8)]",
          label: "Completed",
        };
      case "CANCELLED":
        return {
          bg: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
          dot: "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]",
          label: "Terminated",
        };
      case "VALIDATED":
      default:
        return {
          bg: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
          dot: "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]",
          label: "Ongoing",
        };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] w-full">
        <LoadingScreen fullScreen={false} />
      </div>
    );
  }

  const totalTracked = Object.values(applicationsByOffer).flat().length;
  const uniqueOffers = Object.keys(applicationsByOffer);

  const filteredOffers = Object.entries(applicationsByOffer).reduce((acc, [offer, applications]) => {
    if (offerFilter !== "ALL_OFFERS" && offer !== offerFilter) {
      return acc;
    }

    const filtered = applications.filter(app => {
      const statusRaw = String(app.status || "").trim().toUpperCase();
      let mappedStatus = "ONGOING";
      if (statusRaw === "COMPLETE") mappedStatus = "COMPLETED";
      else if (statusRaw === "CANCELLED") mappedStatus = "TERMINATED";

      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = app.candidate.toLowerCase().includes(searchLower) || (app.email && app.email.toLowerCase().includes(searchLower));
      const matchesStatus = statusFilter === "ALL" || mappedStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });

    if (filtered.length > 0) {
      acc[offer] = filtered;
    }
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6 bg-background h-full" style={{ fontFamily: appleFont }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight flex items-center gap-2.5">
            Internship Track
            {totalTracked > 0 && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 select-none">
                {totalTracked}
              </span>
            )}
          </h1>
          <p className="text-[13px] font-medium text-gray-500 dark:text-zinc-400 mt-1">
            Track your ongoing, completed, and stopped internships.
          </p>
        </div>
      </div>

      {/* Toolbar Container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
        {/* Left Side: Offer Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowOfferFilter(!showOfferFilter)}
              className={`flex items-center justify-between gap-2 px-3 py-1.5 border rounded-lg text-xs bg-white dark:bg-zinc-900 font-semibold shadow-sm focus:outline-none transition-colors w-56 ${offerFilter !== "ALL_OFFERS"
                  ? "border-blue-500/50 text-blue-600 dark:text-blue-400"
                  : "border-gray-255/80 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-850"
                }`}
            >
              <span className="truncate">
                {offerFilter === "ALL_OFFERS" ? "All Offers" : (offerFilter.length > 25 ? offerFilter.slice(0, 25) + "..." : offerFilter)}
              </span>
              <svg className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${showOfferFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showOfferFilter && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowOfferFilter(false)} />
                <div className="absolute left-0 mt-1.5 w-64 max-h-60 overflow-y-auto rounded-lg bg-white dark:bg-zinc-850 border border-gray-200 dark:border-zinc-700/80 shadow-lg py-1 z-20 text-left sidebar-scroll">
                  <button
                    className={`w-full text-left px-4 py-2 text-[12px] font-semibold transition-colors truncate block ${offerFilter === "ALL_OFFERS"
                        ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                      }`}
                    onClick={() => {
                      setOfferFilter("ALL_OFFERS");
                      setShowOfferFilter(false);
                    }}
                  >
                    All Offers
                  </button>
                  {uniqueOffers.map(offer => (
                    <button
                      key={offer}
                      className={`w-full text-left px-4 py-2 text-[12px] font-semibold transition-colors truncate block ${offerFilter === offer
                          ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                        }`}
                      onClick={() => {
                        setOfferFilter(offer);
                        setShowOfferFilter(false);
                      }}
                    >
                      {offer}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Search & Status Filter */}
        <div className="flex items-center gap-2">
          {/* Live Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidate or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 border border-gray-255/80 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900 w-48 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800 dark:text-zinc-200 shadow-sm"
            />
          </div>

          {/* Live Status Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusFilter(!showStatusFilter)}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs bg-white dark:bg-zinc-900 font-semibold shadow-sm focus:outline-none transition-colors ${statusFilter !== "ALL"
                  ? "border-blue-500/50 text-blue-600 dark:text-blue-400"
                  : "border-gray-255/80 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-850"
                }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Status: {statusFilter === "ALL" ? "All" : statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()}</span>
            </button>

            {showStatusFilter && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowStatusFilter(false)} />
                <div className="absolute right-0 mt-1.5 w-40 rounded-lg bg-white dark:bg-zinc-850 border border-gray-200 dark:border-zinc-700/80 shadow-lg py-1 z-20 text-left">
                  {["ALL", "ONGOING", "COMPLETED", "TERMINATED"].map((status) => (
                    <button
                      key={status}
                      className={`w-full text-left px-4 py-2 text-[12px] font-semibold transition-colors flex items-center gap-2 ${statusFilter === status
                          ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                        }`}
                      onClick={() => {
                        setStatusFilter(status);
                        setShowStatusFilter(false);
                      }}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${status === "ALL" ? "bg-gray-400" :
                          status === "ONGOING" ? "bg-blue-500" :
                            status === "COMPLETED" ? "bg-green-500" :
                              "bg-red-500"
                        }`} />
                      {status === "ALL" ? "All Statuses" : status.charAt(0) + status.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {Object.keys(filteredOffers).length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-[10px] shadow-sm overflow-hidden p-10 text-center flex flex-col items-center justify-center space-y-3 bg-gray-50/50 dark:bg-zinc-900/50">
          <span className="text-gray-400 dark:text-zinc-600">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
          </span>
          <span className="text-[13px] font-medium text-gray-500 dark:text-zinc-400">
            No tracked internships found.
          </span>
        </div>
      ) : (
        Object.entries(filteredOffers).map(([offer, applications]) => {
          const currentPage = currentPages[offer] || 1;
          const totalPages = Math.ceil(applications.length / entriesPerPage) || 1;
          const startIndex = (currentPage - 1) * entriesPerPage;
          const paginatedApplications = applications.slice(startIndex, startIndex + entriesPerPage);

          return (
            <div key={offer} className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-[10px] shadow-sm overflow-hidden mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Table Section Header */}
              <div className="px-6 py-4 border-b border-gray-150 dark:border-zinc-800/80 bg-gray-50/40 dark:bg-zinc-900/40">
                <h2 className="text-[14px] font-bold text-gray-900 dark:text-zinc-100">{offer}</h2>
              </div>
              <table className="w-full table-fixed border-collapse text-left">
                <thead>
                  <tr className="bg-blue-50 dark:bg-zinc-900 border-b border-blue-100 dark:border-zinc-800">
                    <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6">Candidate</th>
                    <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 text-left">Status</th>
                    <th className="hidden lg:table-cell text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 text-left">Email</th>
                    <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 text-left w-32">Certificate</th>
                    <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedApplications.map((application) => {
                    const status = String(application.status || "").trim().toUpperCase();
                    const style = getBadgeStyle(status);

                    return (
                      <tr
                        key={application.id}
                        className="transition-colors duration-150 border-b border-gray-100 dark:border-zinc-800/60 last:border-b-0 hover:bg-gray-50/40 dark:hover:bg-zinc-900/35"
                      >
                        <td className="py-4 px-6 text-left">
                          <span className="text-[13px] font-semibold text-gray-900 dark:text-zinc-100 truncate">{application.candidate}</span>
                        </td>
                        <td className="py-4 px-6 text-left">
                          <span className={`inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${style.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {style.label}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell py-4 px-6 text-left">
                          <span className="text-[12px] text-gray-500 dark:text-zinc-400 truncate">{application.email}</span>
                        </td>
                        <td className="py-4 px-6 text-left">
                          {status === "COMPLETE" ? (
                            <button
                              onClick={() => downloadCertificate(application)}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-bold tracking-wide rounded-[6px] bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 border border-blue-200/50 dark:border-blue-800/30 transition-all duration-200"
                            >
                              <DownloadCloud className="w-3.5 h-3.5" />
                              Download
                            </button>
                          ) : (
                            <span className="text-gray-300 dark:text-zinc-600 font-bold">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {status !== "COMPLETE" && status !== "CANCELLED" && (
                            <button
                              className="inline-flex items-center justify-center px-3 py-1.5 text-[11px] font-bold tracking-wide rounded-[6px] bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-900/30 transition-all duration-200"
                              onClick={() => confirmStop(offer, application.id)}
                            >
                              Kick
                            </button>
                          )}
                          {status === "COMPLETE" && (
                            <span className="text-[12px] text-green-600 dark:text-green-500 font-bold">Finished</span>
                          )}
                          {status === "CANCELLED" && (
                            <span className="text-[12px] text-red-600 dark:text-red-500 font-bold">Terminated</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination Footer */}
              <div className="px-6 py-4 border-t border-gray-150 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <span>Show</span>
                  <select
                    value={entriesPerPage}
                    onChange={(e) => {
                      setEntriesPerPage(Number(e.target.value));
                      setCurrentPages({}); // Reset all pages to 1
                    }}
                    className="border border-gray-255/80 dark:border-zinc-800 rounded px-1.5 py-0.5 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>Candidates per page</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPages(prev => ({ ...prev, [offer]: Math.max(currentPage - 1, 1) }))}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-855 rounded text-gray-400 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPages(prev => ({ ...prev, [offer]: pageNum }))}
                        className={`w-6 h-6 flex items-center justify-center rounded-md font-semibold text-xs transition-colors ${currentPage === pageNum
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
                    onClick={() => setCurrentPages(prev => ({ ...prev, [offer]: Math.min(currentPage + 1, totalPages) }))}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-855 rounded text-gray-400 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )
        })
      )}

      {/* Stop Internship Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Stop Internship</DialogTitle>
            <DialogDescription className="text-sm pt-2">
              Are you sure you want to kick this student and terminate their internship? This action is <strong className="text-red-600">irreversible</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleStopInternship}>
              Yes, Kick
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
