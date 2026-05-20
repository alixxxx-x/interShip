import { useEffect, useState } from "react";
import { Check, X, Pencil, Mail, FileText, MoreHorizontal, ChevronLeft, ChevronRight, Search, Filter } from "lucide-react";
import api from "@/api/api";
import { useToast } from "@/components/ui/custom-toast";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function AllApplications() {
  const toast = useToast();
  const [applicationsByOffer, setApplicationsByOffer] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState("");
  const [showOfferDropdown, setShowOfferDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Pagination State
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchAllApplications = async () => {
      try {
        const response = await api.get('/applications/');
        const applications = response.data.results || response.data;

        const filteredApplications = applications.filter(app => {
          const status = String(app.status || "").trim().toUpperCase();
          return status !== "VALIDATED" && status !== "COMPLETE" && status !== "CANCELLED" && app.is_validated_by_admin === false;
        });

        const grouped = filteredApplications.reduce((acc, app) => {
          const { offer } = app;
          if (!acc[offer]) {
            acc[offer] = [];
          }
          acc[offer].push(app);
          return acc;
        }, {});

        setApplicationsByOffer(grouped);
        
        const offersList = Object.keys(grouped);
        if (offersList.length > 0) {
          setSelectedOffer("ALL_OFFERS");
        }
      } catch (error) {
        console.error("Failed to load applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllApplications();
  }, []);

  // Reset page index & selection on filter updates
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [searchQuery, statusFilter, selectedOffer, entriesPerPage]);

  const handleStatusChange = async (offer, id, newStatus) => {
    try {
      await api.patch(`/applications/${id}/update/`, { status: newStatus });
      setApplicationsByOffer(prev => {
        const updatedApplications = prev[offer].map(app =>
          app.id === id ? { ...app, status: newStatus } : app
        );
        return { ...prev, [offer]: updatedApplications };
      });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDownloadCV = async (application) => {
    try {
      const res = await api.get(`/cv/generate/${application.student}/`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${application.candidate.replace(/\s+/g, '_')}_CV.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      if (application.cv) {
        window.open(application.cv, '_blank');
      } else {
        toast.warning('No CV available');
      }
    }
  };

  // Cohesive vector avatars clustered around website signature blue/indigo theme
  const renderAvatar = (name) => {
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hues = [215, 220, 225, 230, 240]; // Brand Blue palette
    const hue = hues[hash % hues.length];
    return (
      <svg className="w-10 h-10 rounded-full shrink-0" viewBox="0 0 100 100">
        <rect width="100" height="100" fill={`hsl(${hue}, 60%, 96%)`} />
        <circle cx="50" cy="40" r="20" fill={`hsl(${hue}, 65%, 82%)`} />
        <path d="M 20 85 Q 50 55 80 85" fill={`hsl(${hue}, 65%, 82%)`} />
      </svg>
    );
  };

  const getBadgeStyle = (status) => {
    switch (status) {
      case "PENDING":
        return {
          bg: "bg-purple-50 dark:bg-purple-950/25 text-purple-600 dark:text-purple-400 border border-purple-100/60 dark:border-purple-900/30",
          dot: "bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.8)]"
        };
      case "ACCEPTED":
        return {
          bg: "bg-blue-50 dark:bg-blue-950/25 text-blue-600 dark:text-blue-400 border border-blue-100/60 dark:border-blue-900/30",
          dot: "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]"
        };
      case "VALIDATED":
      case "COMPLETE":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/25 text-emerald-600 dark:text-emerald-400 border border-emerald-100/60 dark:border-emerald-900/30",
          dot: "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"
        };
      case "REJECTED":
      case "CANCELLED":
        return {
          bg: "bg-rose-50 dark:bg-rose-950/25 text-rose-600 dark:text-rose-400 border border-rose-100/60 dark:border-rose-900/30",
          dot: "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]"
        };
      default:
        return {
          bg: "bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border border-gray-150 dark:border-zinc-700/50",
          dot: "bg-gray-400 shadow-none"
        };
    }
  };

  const getStatusLabel = (application) => {
    const status = application.status;
    const isAdminRejected = status === "REJECTED" && !!application.admin_rejection_date;
    if (isAdminRejected) return "Rejected by Admin";

    const labels = {
      "PENDING": "Pending",
      "ACCEPTED": "Accepted",
      "VALIDATED": "Validated",
      "COMPLETE": "Completed",
      "REJECTED": "Rejected",
      "CANCELLED": "Cancelled"
    };
    return labels[status] || status;
  };

  const offers = Object.keys(applicationsByOffer);
  const currentOfferIndex = offers.indexOf(selectedOffer);

  const prevOffer = () => {
    if (currentOfferIndex > 0) {
      setSelectedOffer(offers[currentOfferIndex - 1]);
    }
  };

  const nextOffer = () => {
    if (currentOfferIndex < offers.length - 1) {
      setSelectedOffer(offers[currentOfferIndex + 1]);
    }
  };

  const activeApplications = selectedOffer === "ALL_OFFERS" ? Object.values(applicationsByOffer).flat() : (applicationsByOffer[selectedOffer] || []);
  const filteredApplications = activeApplications.filter(app => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = app.candidate.toLowerCase().includes(searchLower) || (app.email && app.email.toLowerCase().includes(searchLower));
    const matchesStatus = statusFilter === "ALL" || app.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Paginated List
  const totalPages = Math.ceil(filteredApplications.length / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + entriesPerPage);

  // Checkbox Event Handlers
  const handleToggleRow = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isAllSelected = paginatedApplications.length > 0 && paginatedApplications.every(app => selectedIds.has(app.id));

  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        paginatedApplications.forEach(app => next.delete(app.id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        paginatedApplications.forEach(app => next.add(app.id));
        return next;
      });
    }
  };

  // Bulk Actions
  const handleBulkAccept = async () => {
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map(id => api.patch(`/applications/${id}/update/`, { status: 'ACCEPTED' })));
      
      setApplicationsByOffer(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(offer => {
          next[offer] = next[offer].map(app =>
            selectedIds.has(app.id) ? { ...app, status: 'ACCEPTED' } : app
          );
        });
        return next;
      });
      setSelectedIds(new Set());
      toast.success(`Successfully accepted ${ids.length} applications`);
    } catch (error) {
      console.error("Bulk accept failed:", error);
      toast.error("Bulk accept operation failed");
    }
  };

  const handleBulkReject = async () => {
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map(id => api.patch(`/applications/${id}/update/`, { status: 'REJECTED' })));
      
      setApplicationsByOffer(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(offer => {
          next[offer] = next[offer].map(app =>
            selectedIds.has(app.id) ? { ...app, status: 'REJECTED' } : app
          );
        });
        return next;
      });
      setSelectedIds(new Set());
      toast.success(`Successfully rejected ${ids.length} applications`);
    } catch (error) {
      console.error("Bulk reject failed:", error);
      toast.error("Bulk reject operation failed");
    }
  };

  const appleFont = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  return (
    <div className="p-6 space-y-6 bg-background h-full" style={{ fontFamily: appleFont }}>
      
      {/* Styles for custom dropdown lists and scrollbars */}
      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* Page Title & Bulk Actions Overlay */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight">All Applications</h1>
          {filteredApplications.length > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 select-none">
              {filteredApplications.length}
            </span>
          )}
        </div>
        
        {/* Bulk Action Panel - Soft blue matching site accent */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 bg-blue-50/50 dark:bg-blue-950/15 border border-blue-100 dark:border-blue-900/30 rounded-lg px-3 py-1.5 shadow-sm animate-in fade-in slide-in-from-top-1 duration-150">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">{selectedIds.size} Selected</span>
            <div className="h-4 w-[1px] bg-blue-200 dark:bg-blue-900/40" />
            <button 
              onClick={handleBulkAccept}
              className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 px-2 py-0.5 rounded transition-colors"
            >
              Accept All
            </button>
            <button 
              onClick={handleBulkReject}
              className="text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-2 py-0.5 rounded transition-colors"
            >
              Reject All
            </button>
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="text-[11px] font-medium text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 px-2 py-0.5 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Mockup Toolbar Container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
        {/* Left Side: Mockup Offer Navigation controls */}
        <div className="flex items-center gap-4 text-xs font-semibold text-gray-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="text-gray-900 dark:text-zinc-100">Offer Selector</span>
            <div className="flex items-center border border-gray-255/80 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
              <button 
                onClick={prevOffer}
                disabled={currentOfferIndex <= 0}
                className="p-1.5 hover:bg-gray-50 dark:hover:bg-zinc-850 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={nextOffer}
                disabled={currentOfferIndex >= offers.length - 1}
                className="p-1.5 hover:bg-gray-50 dark:hover:bg-zinc-850 border-l border-gray-150 dark:border-zinc-800 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Custom Styled Offer Dropdown (Replaced ugly native select) */}
          <div className="relative">
            <button
              onClick={() => setShowOfferDropdown(!showOfferDropdown)}
              className="flex items-center justify-between gap-2 bg-white dark:bg-zinc-900 border border-gray-255/80 dark:border-zinc-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs text-gray-850 dark:text-zinc-200 cursor-pointer font-semibold shadow-sm w-52 text-left"
            >
              <span className="truncate">
                {selectedOffer === "ALL_OFFERS" ? "All Offers" : (selectedOffer ? (selectedOffer.length > 25 ? `${selectedOffer.slice(0, 25)}...` : selectedOffer) : "Select Offer")}
              </span>
              <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${showOfferDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showOfferDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowOfferDropdown(false)} />
                <div className="absolute left-0 mt-1.5 w-64 max-h-60 overflow-y-auto rounded-lg bg-white dark:bg-zinc-850 border border-gray-200 dark:border-zinc-700/80 shadow-lg py-1 z-20 text-left sidebar-scroll">
                  <button
                    className={`w-full text-left px-4 py-2 text-[12px] font-semibold transition-colors truncate block ${
                      selectedOffer === "ALL_OFFERS" 
                        ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400" 
                        : "text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                    }`}
                    onClick={() => {
                      setSelectedOffer("ALL_OFFERS");
                      setShowOfferDropdown(false);
                    }}
                  >
                    All Offers
                  </button>
                  {offers.map(o => (
                    <button
                      key={o}
                      className={`w-full text-left px-4 py-2 text-[12px] font-semibold transition-colors truncate block ${
                        selectedOffer === o 
                          ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400" 
                          : "text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                      }`}
                      onClick={() => {
                        setSelectedOffer(o);
                        setShowOfferDropdown(false);
                      }}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Mockup search & buttons */}
        <div className="flex items-center gap-2">
          {/* Live Search - Signature focus highlights */}
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
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs bg-white dark:bg-zinc-900 font-semibold shadow-sm focus:outline-none transition-colors ${
                statusFilter !== "ALL"
                  ? "border-blue-500/50 text-blue-600 dark:text-blue-400"
                  : "border-gray-255/80 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-55 dark:hover:bg-zinc-850"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Status: {statusFilter === "ALL" ? "All" : statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()}</span>
            </button>
            
            {showStatusFilter && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowStatusFilter(false)} />
                <div className="absolute right-0 mt-1.5 w-40 rounded-lg bg-white dark:bg-zinc-850 border border-gray-200 dark:border-zinc-700/80 shadow-lg py-1 z-20 text-left">
                  {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map((status) => (
                    <button
                      key={status}
                      className={`w-full text-left px-4 py-2 text-[12px] font-semibold transition-colors flex items-center gap-2 ${
                        statusFilter === status 
                          ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400" 
                          : "text-gray-600 dark:text-zinc-400 hover:bg-gray-55 dark:hover:bg-zinc-800/50"
                      }`}
                      onClick={() => {
                        setStatusFilter(status);
                        setShowStatusFilter(false);
                      }}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        status === "ALL" ? "bg-gray-400" :
                        status === "PENDING" ? "bg-purple-500" :
                        status === "ACCEPTED" ? "bg-blue-500" :
                        "bg-rose-500"
                      }`} />
                      {status === "ALL" ? "All Statuses" : status.charAt(0) + status.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Primary Action Button - Royal Blue brand color (#1d4ed8) */}
          <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/55">
            <span>+ Add New</span>
          </button>
        </div>
      </div>

      {/* Main Mockup Table Container */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-xl shadow-sm overflow-visible">
        
        {/* Table Body View */}
        <div className="w-full">
          {paginatedApplications.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500 dark:text-zinc-500">
              No applications found matching the search/status filters.
            </div>
          ) : (
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr className="bg-blue-50 dark:bg-zinc-900 border-b border-blue-100 dark:border-zinc-800">
                  {/* Select All Checkbox Column - Royal Blue check fill */}
                  <th className="py-3.5 px-6 text-center w-12 shrink-0">
                    <button 
                      onClick={handleToggleAll}
                      className={`w-4 h-4 rounded-[5px] border flex items-center justify-center cursor-pointer focus:outline-none transition-all duration-150 hover:scale-105 active:scale-95 ${
                        isAllSelected 
                          ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                          : "border-blue-200 dark:border-blue-900/40 bg-white dark:bg-zinc-855 hover:border-blue-500/80"
                      }`}
                    >
                      {isAllSelected && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                    </button>
                  </th>
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6">Candidate</th>
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 text-center">Status</th>
                  {/* Breakpoint: Applied Date is only visible on lg (Desktop) */}
                  <th className="hidden lg:table-cell text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6">Applied Date</th>
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 text-center">CV</th>
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApplications.map((application) => {
                  const isSelected = selectedIds.has(application.id);
                  return (
                    <tr 
                      key={application.id} 
                      className={`transition-colors duration-150 border-b border-gray-100 dark:border-zinc-800/60 last:border-b-0 ${
                        isSelected 
                          ? "bg-blue-50/20 dark:bg-blue-950/10 hover:bg-blue-50/30 dark:hover:bg-blue-950/15" 
                          : "hover:bg-gray-50/40 dark:hover:bg-zinc-900/35"
                      }`}
                    >
                      {/* Row Selection Checkbox - Royal Blue check fill */}
                      <td className="py-4 px-6 text-center w-12 shrink-0">
                        <button 
                          onClick={() => handleToggleRow(application.id)}
                          className={`w-4 h-4 rounded-[5px] border flex items-center justify-center cursor-pointer focus:outline-none transition-all duration-150 hover:scale-105 active:scale-95 ${
                            isSelected 
                              ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                              : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-855 hover:border-blue-500/80"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-left">
                        <div className="flex items-center gap-3">
                          {/* High-Fidelity SVG profile avatar matching mockup */}
                          {renderAvatar(application.candidate)}
                          {/* Details */}
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-semibold text-gray-900 dark:text-zinc-100 truncate">{application.candidate}</span>
                            <span className="text-[11px] text-gray-400 dark:text-zinc-500 truncate">{application.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {(() => {
                          const style = getBadgeStyle(application.status);
                          return (
                            <span className={`inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${style.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                              {getStatusLabel(application)}
                            </span>
                          );
                        })()}
                      </td>
                      {/* Breakpoint: Applied Date is only visible on lg (Desktop) */}
                      <td className="hidden lg:table-cell text-[12px] text-gray-400 dark:text-zinc-500 py-4 px-6">{application.application_date}</td>
                      <td className="py-4 px-6 text-center">
                        <button
                          className="inline-flex items-center justify-center gap-1.5 text-[11px] font-bold h-7 px-3 rounded-lg bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 transition-all duration-200 active:scale-[0.97] shadow-[0_1px_2px_rgba(29,78,216,0.05)] focus:outline-none"
                          onClick={() => handleDownloadCV(application)}
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-500/70 dark:text-blue-400/60" />
                          Download
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right relative">
                        <button
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors focus:outline-none"
                          onClick={() => setActiveDropdownId(activeDropdownId === application.id ? null : application.id)}
                        >
                          <MoreHorizontal className="w-4.5 h-4.5" />
                        </button>

                        {activeDropdownId === application.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)} />
                            <div className="absolute right-6 mt-1 w-36 rounded-lg bg-white dark:bg-zinc-850 border border-gray-200 dark:border-zinc-700/80 shadow-lg py-1 z-20 text-left">
                              {application.status === "PENDING" ? (
                                <>
                                  <button
                                    className="w-full text-left px-4 py-2 text-[12px] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 font-semibold flex items-center gap-2"
                                    onClick={() => {
                                      handleStatusChange(selectedOffer, application.id, 'ACCEPTED');
                                      setActiveDropdownId(null);
                                    }}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    Accept
                                  </button>
                                  <button
                                    className="w-full text-left px-4 py-2 text-[12px] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-semibold flex items-center gap-2"
                                    onClick={() => {
                                      handleStatusChange(selectedOffer, application.id, 'REJECTED');
                                      setActiveDropdownId(null);
                                    }}
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    Reject
                                  </button>
                                </>
                              ) : application.status === "ACCEPTED" ? (
                                <button
                                  className="w-full text-left px-4 py-2 text-[12px] text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-750 font-semibold flex items-center gap-2 disabled:opacity-50"
                                  disabled={application.is_validated_by_admin}
                                  onClick={() => {
                                    handleStatusChange(selectedOffer, application.id, 'PENDING');
                                    setActiveDropdownId(null);
                                  }}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  Edit Status
                                </button>
                              ) : (
                                <div className="px-4 py-2 text-[11px] text-gray-400 dark:text-zinc-500 italic">No actions</div>
                              )}
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Mockup Pagination Footer */}
        <div className="px-6 py-4 border-t border-gray-150 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <span>Show</span>
            <select 
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              className="border border-gray-255/80 dark:border-zinc-800 rounded px-1.5 py-0.5 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>Candidates per page</span>
          </div>
          
          {/* Pagination buttons matching website signature highlights */}
          <div className="flex items-center gap-1">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-855 rounded text-gray-400 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-6 h-6 flex items-center justify-center rounded-md font-semibold text-xs transition-colors ${
                    currentPage === pageNum
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-855 rounded text-gray-400 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
