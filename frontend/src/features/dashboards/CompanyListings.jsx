import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash, 
  CheckCircle, 
  Clock, 
  Archive,
  AlertCircle,
  Briefcase,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import api from "@/api/api";
import CreateOfferModal from "./CreateOfferModal";
import { useToast } from "@/components/ui/custom-toast";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function CompanyListings() {
  const navigate = useNavigate();
  const toast = useToast();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOffer, setEditingOffer] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Filter and Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const appleFont = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setIsEditModalOpen(true);
    setActiveDropdownId(null);
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      const profileRes = await api.get("/auth/profile/");
      const currentUser = profileRes.data;
      const companyId = currentUser.id;
      const isAdmin = currentUser.role === 'ADMIN';
      
      const endpoint = currentUser.role === 'COMPANY' ? "/internships/company/" : "/internships/";
      const res = await api.get(endpoint);
      
      const rawData = res.data.results || res.data;
      const listingsData = Array.isArray(rawData) ? rawData : [];
      
      const filtered = listingsData
        .filter(item => {
          return isAdmin || item.company == companyId;
        })
        .map(item => {
          let skills = [];
          if (item.internship_skills) {
            try {
              skills = typeof item.internship_skills === 'string' 
                ? JSON.parse(item.internship_skills) 
                : item.internship_skills;
              if (!Array.isArray(skills)) skills = [skills];
            } catch (e) {
              skills = [item.internship_skills];
            }
          }
          return {
            ...item,
            tech: skills,
            required_skills: skills
          };
        });
        
      setListings(filtered);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, entriesPerPage]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/internships/${id}/update/`, { status: newStatus });
      fetchListings(); 
      setActiveDropdownId(null);
      toast.success("Status updated successfully.");
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/internships/${id}/`);
      fetchListings();
      setActiveDropdownId(null);
      toast.success("Listing deleted successfully.");
    } catch (err) {
      console.error("Failed to delete listing:", err);
      toast.error("Failed to delete listing.");
    }
  };

  const getBadgeStyle = (status) => {
    switch (status) {
      case "DRAFT":
        return { bg: "bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700", dot: "bg-gray-400", label: "Draft" };
      case "OPEN_FOR_APPLICATION":
        return { bg: "bg-blue-50 dark:bg-blue-950/25 text-blue-600 dark:text-blue-400 border border-blue-100/60 dark:border-blue-900/30", dot: "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]", label: "Open" };
      case "ONGOING":
        return { bg: "bg-purple-50 dark:bg-purple-950/25 text-purple-600 dark:text-purple-400 border border-purple-100/60 dark:border-purple-900/30", dot: "bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.8)]", label: "Ongoing" };
      case "CLOSED_FOR_APPLICATION":
      case "ARCHIVED":
        return { bg: "bg-orange-50 dark:bg-orange-950/25 text-orange-600 dark:text-orange-400 border border-orange-100/60 dark:border-orange-900/30", dot: "bg-orange-500", label: status === "ARCHIVED" ? "Archived" : "Closed" };
      case "FINISHED":
        return { bg: "bg-emerald-50 dark:bg-emerald-950/25 text-emerald-600 dark:text-emerald-400 border border-emerald-100/60 dark:border-emerald-900/30", dot: "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]", label: "Finished" };
      case "CANCELLED":
        return { bg: "bg-rose-50 dark:bg-rose-950/25 text-rose-600 dark:text-rose-400 border border-rose-100/60 dark:border-rose-900/30", dot: "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]", label: "Cancelled" };
      default:
        return { bg: "bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border border-gray-150 dark:border-zinc-700/50", dot: "bg-gray-400 shadow-none", label: status };
    }
  };

  // Filter Data
  const filteredListings = listings.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(searchLower) || String(item.id).includes(searchLower);
    const matchesStatus = statusFilter === "ALL" || item.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Pagination
  const totalPages = Math.ceil(filteredListings.length / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedListings = filteredListings.slice(startIndex, startIndex + entriesPerPage);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] w-full">
        <LoadingScreen fullScreen={false} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background h-full" style={{ fontFamily: appleFont }}>
      {/* Header and Toolbar Container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight flex items-center gap-2.5">
            My Internship Listings
            {listings.length > 0 && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 select-none">
                {listings.length} Listings
              </span>
            )}
          </h1>
          <p className="text-[13px] font-medium text-gray-500 dark:text-zinc-400 mt-1">
            Manage your posted internship opportunities and track their status.
          </p>
        </div>

        {/* Search, Filter, and Action */}
        <div className="flex items-center gap-2">
          {/* Live Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search title or ID"
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
                  : "border-gray-255/80 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-850"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Status: {statusFilter === "ALL" ? "All" : statusFilter.replace(/_/g, ' ')}</span>
            </button>
            
            {showStatusFilter && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowStatusFilter(false)} />
                <div className="absolute right-0 mt-1.5 w-52 rounded-lg bg-white dark:bg-zinc-850 border border-gray-200 dark:border-zinc-700/80 shadow-lg py-1 z-20 text-left">
                  {["ALL", "DRAFT", "OPEN_FOR_APPLICATION", "CLOSED_FOR_APPLICATION", "ONGOING", "FINISHED", "CANCELLED", "ARCHIVED"].map((status) => {
                    const style = getBadgeStyle(status);
                    return (
                      <button
                        key={status}
                        className={`w-full text-left px-4 py-2 text-[12px] font-semibold transition-colors flex items-center gap-2 ${
                          statusFilter === status 
                            ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400" 
                            : "text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                        }`}
                        onClick={() => {
                          setStatusFilter(status);
                          setShowStatusFilter(false);
                        }}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${status === "ALL" ? "bg-gray-400" : style.dot.split(' ')[0]}`} />
                        {status === "ALL" ? "All Statuses" : style.label}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          <button 
            onClick={() => navigate("/companydashboard/new-offer")}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/55"
          >
            <span>+ Add New</span>
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-xl shadow-sm overflow-visible animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        <div className="w-full">
          {paginatedListings.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center space-y-3 bg-gray-50/50 dark:bg-zinc-900/50">
              <span className="text-gray-400 dark:text-zinc-600">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              </span>
              <span className="text-[13px] font-medium text-gray-500 dark:text-zinc-400">
                No listings found matching your search or filters.
              </span>
            </div>
          ) : (
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr className="bg-blue-50 dark:bg-zinc-900 border-b border-blue-100 dark:border-zinc-800">
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 w-[280px]">Internship Title</th>
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 text-left">Status</th>
                  <th className="hidden lg:table-cell text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 text-left">Location</th>
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 text-center">Positions</th>
                  <th className="hidden lg:table-cell text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 text-left w-36">Dates</th>
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedListings.map((item) => {
                  const style = getBadgeStyle(item.status);
                  return (
                    <tr 
                      key={item.id} 
                      className="transition-colors duration-150 border-b border-gray-100 dark:border-zinc-800/60 last:border-b-0 hover:bg-gray-50/40 dark:hover:bg-zinc-900/35 group"
                    >
                      <td 
                        className="py-2.5 px-6 text-left cursor-pointer"
                        onClick={() => navigate(`/internships/${item.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          {item.internship_image ? (
                            <img 
                              src={item.internship_image} 
                              alt={item.title} 
                              className="w-10 h-10 rounded-md object-cover border border-gray-200 dark:border-zinc-700 shadow-sm"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-gray-100 dark:bg-zinc-800 flex items-center justify-center border border-gray-200 dark:border-zinc-700 shadow-sm">
                              <Briefcase className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-semibold text-gray-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.title}</span>
                            <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-mono tracking-wider truncate mt-0.5">ID: {item.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-6 text-left">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${style.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {style.label}
                          </span>
                          {item.status === 'DRAFT' && (
                            <button 
                              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(item.id, "OPEN_FOR_APPLICATION");
                              }}
                            >
                              Publish
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="hidden lg:table-cell py-2.5 px-6 text-left">
                        <span className="text-[12px] text-gray-600 dark:text-zinc-400 capitalize bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-medium border border-gray-200 dark:border-zinc-700">
                          {item.internship_location?.toLowerCase() || "onsite"}
                        </span>
                      </td>
                      <td className="py-2.5 px-6 text-center">
                        <span className="text-[12px] font-bold text-gray-800 dark:text-zinc-200">
                          {item.number_of_places}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell py-2.5 px-6 text-left whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-[11px] text-gray-500 dark:text-zinc-400"><span className="font-semibold text-gray-400">Start:</span> {item.offer_start_date}</span>
                          <span className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5"><span className="font-semibold text-gray-400">End:</span> {item.offer_end_date}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-6 text-right relative">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="inline-flex items-center justify-center gap-1.5 text-[11px] font-bold h-7 px-3 rounded-lg bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 transition-all duration-200 active:scale-[0.97] shadow-[0_1px_2px_rgba(29,78,216,0.05)] focus:outline-none"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="w-3.5 h-3.5 text-blue-500/70 dark:text-blue-400/60" />
                            Edit
                          </button>
                          
                          <button
                            className="inline-flex items-center justify-center h-7 w-7 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors focus:outline-none"
                            onClick={() => setActiveDropdownId(activeDropdownId === item.id ? null : item.id)}
                          >
                            <MoreHorizontal className="w-4.5 h-4.5" />
                          </button>

                          {activeDropdownId === item.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)} />
                              <div className="absolute right-6 mt-1 w-52 rounded-lg bg-white dark:bg-zinc-850 border border-gray-200 dark:border-zinc-700/80 shadow-lg py-1.5 z-20 text-left">
                                <button 
                                  className="w-full text-left px-4 py-2 text-[12px] text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 font-semibold flex items-center gap-2"
                                  onClick={() => navigate(`/internships/${item.id}`)}
                                >
                                  <Eye className="w-3.5 h-3.5 text-gray-400" />
                                  View Public Page
                                </button>
                                
                                <div className="h-px bg-gray-150 dark:bg-zinc-800 my-1.5" />
                                <div className="px-4 py-1 text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                                  Change Status
                                </div>
                                
                                <button 
                                  className="w-full text-left px-4 py-2 text-[12px] text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 font-semibold flex items-center gap-2"
                                  onClick={() => handleUpdateStatus(item.id, "OPEN_FOR_APPLICATION")}
                                >
                                  <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                                  Open for Applications
                                </button>
                                <button 
                                  className="w-full text-left px-4 py-2 text-[12px] text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 font-semibold flex items-center gap-2"
                                  onClick={() => handleUpdateStatus(item.id, "ONGOING")}
                                >
                                  <Clock className="w-3.5 h-3.5 text-purple-500" />
                                  Mark as Ongoing
                                </button>
                                <button 
                                  className="w-full text-left px-4 py-2 text-[12px] text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 font-semibold flex items-center gap-2"
                                  onClick={() => handleUpdateStatus(item.id, "CLOSED_FOR_APPLICATION")}
                                >
                                  <Archive className="w-3.5 h-3.5 text-orange-500" />
                                  Close Applications
                                </button>
                                <button 
                                  className="w-full text-left px-4 py-2 text-[12px] text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 font-semibold flex items-center gap-2"
                                  onClick={() => handleUpdateStatus(item.id, "FINISHED")}
                                >
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                  Mark as Finished
                                </button>
                                <button 
                                  className="w-full text-left px-4 py-2 text-[12px] text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 font-semibold flex items-center gap-2"
                                  onClick={() => handleUpdateStatus(item.id, "ARCHIVED")}
                                >
                                  <Archive className="w-3.5 h-3.5 text-gray-500" />
                                  Archive Listing
                                </button>

                                <div className="h-px bg-gray-150 dark:bg-zinc-800 my-1.5" />
                                
                                <button 
                                  className="w-full text-left px-4 py-2 text-[12px] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-semibold flex items-center gap-2"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                  Delete Offer
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
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
            <span>Listings per page</span>
          </div>
          
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

      <CreateOfferModal 
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        initialData={editingOffer}
        onOfferCreated={fetchListings}
      />
    </div>
  );
}
