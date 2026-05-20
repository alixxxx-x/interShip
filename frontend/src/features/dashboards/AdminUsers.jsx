import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  MoreHorizontal, 
  Search, 
  User, 
  Mail,
  CheckCircle, 
  AlertCircle,
  UserCheck, 
  UserX, 
  Trash2, 
  GraduationCap, 
  Building2,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import api from "@/api/api";
import { useToast } from "@/components/ui/custom-toast";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  
  // Pagination State
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Get search params for role filtering
  const [searchParams, setSearchParams] = useSearchParams();
  const roleFilter = searchParams.get("role") || "ALL"; // ALL, STUDENT, COMPANY, ADMIN_UNIV, ADMIN_DEPT
  const departmentFilter = searchParams.get("department");

  const appleFont = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let url = "/users/";
      const params = [];
      if (roleFilter && roleFilter !== "ALL") params.push(`role=${roleFilter}`);
      if (departmentFilter) params.push(`department=${departmentFilter}`);
      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }
      const res = await api.get(url);
      setUsers(res.data.results || res.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load user directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, departmentFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, entriesPerPage]);

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = !user.is_active;
      // Optimistic update
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
      await api.patch(`/users/${user.id}/`, { is_active: newStatus });
      toast.success(`${user.username || user.email}'s status updated.`);
    } catch (error) {
      console.error("Failed to toggle status:", error);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: user.is_active } : u));
      toast.error("Failed to update user status.");
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${user.username || user.email}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/users/${user.id}/`);
      toast.success("User account deleted successfully.");
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user account.");
    }
  };

  const filteredUsers = users.filter(user => {
    if (!user) return false;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (user.username || "").toLowerCase().includes(searchLower) ||
      (user.email || "").toLowerCase().includes(searchLower) ||
      (user.first_name || "").toLowerCase().includes(searchLower) ||
      (user.last_name || "").toLowerCase().includes(searchLower) ||
      (user.university_name || "").toLowerCase().includes(searchLower) ||
      String(user.id).includes(searchLower);
    return matchesSearch;
  });

  // Calculate Pagination
  const totalPages = Math.ceil(filteredUsers.length / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + entriesPerPage);

  const getStatusStyle = (isActive) => {
    if (isActive) {
      return { bg: "bg-emerald-50 dark:bg-emerald-950/25 text-emerald-600 dark:text-emerald-400 border border-emerald-100/60 dark:border-emerald-900/30", dot: "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]", label: "Active" };
    }
    return { bg: "bg-rose-50 dark:bg-rose-950/25 text-rose-600 dark:text-rose-400 border border-rose-100/60 dark:border-rose-900/30", dot: "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]", label: "Deactivated" };
  };

  const getRoleStyle = (role) => {
    switch (role) {
      case 'ADMIN_UNIV':
        return { bg: "bg-purple-50 dark:bg-purple-950/25 text-purple-600 dark:text-purple-400 border border-purple-100/60 dark:border-purple-900/30", label: "University Admin" };
      case 'ADMIN_DEPT':
        return { bg: "bg-orange-50 dark:bg-orange-950/25 text-orange-600 dark:text-orange-400 border border-orange-100/60 dark:border-orange-900/30", label: "Department Admin" };
      case 'COMPANY':
        return { bg: "bg-blue-50 dark:bg-blue-950/25 text-blue-600 dark:text-blue-400 border border-blue-100/60 dark:border-blue-900/30", label: "Corporate" };
      case 'STUDENT':
        return { bg: "bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700", label: "Student" };
      default:
        return { bg: "bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border border-gray-150 dark:border-zinc-700/50", label: role?.replace('_', ' ') || 'Unknown' };
    }
  };

  const getHeaderInfo = () => {
    switch (roleFilter) {
      case "STUDENT": return { title: "Student Directory", desc: "Manage all student profiles registered on the platform." };
      case "COMPANY": return { title: "Corporate Directory", desc: "Manage all corporate accounts registered on the platform." };
      case "ADMIN_UNIV": return { title: "University Admins", desc: "Manage academic administrator accounts and access." };
      default: return { title: "System User Directory", desc: "Comprehensive registry of all platform accounts." };
    }
  };

  const headerInfo = getHeaderInfo();

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
            {headerInfo.title}
            {filteredUsers.length > 0 && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 select-none">
                {filteredUsers.length} Users
              </span>
            )}
          </h1>
          <p className="text-[13px] font-medium text-gray-500 dark:text-zinc-400 mt-1">
            {headerInfo.desc}
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex items-center gap-2">
          {/* Live Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 border border-gray-255/80 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900 w-48 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800 dark:text-zinc-200 shadow-sm"
            />
          </div>

          {/* Role Filter Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowRoleFilter(!showRoleFilter)}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs bg-white dark:bg-zinc-900 font-semibold shadow-sm focus:outline-none transition-colors ${
                roleFilter !== "ALL"
                  ? "border-blue-500/50 text-blue-600 dark:text-blue-400"
                  : "border-gray-255/80 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-850"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Role: {roleFilter === "ALL" ? "All" : roleFilter.replace(/_/g, ' ')}</span>
            </button>
            
            {showRoleFilter && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowRoleFilter(false)} />
                <div className="absolute right-0 mt-1.5 w-48 rounded-lg bg-white dark:bg-zinc-850 border border-gray-200 dark:border-zinc-700/80 shadow-lg py-1 z-20 text-left">
                  {["ALL", "STUDENT", "COMPANY", "ADMIN_UNIV", "ADMIN_DEPT"].map((role) => {
                    return (
                      <button
                         key={role}
                         className={`w-full text-left px-4 py-2 text-[12px] font-semibold transition-colors flex items-center gap-2 ${
                           roleFilter === role 
                             ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400" 
                             : "text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                         }`}
                         onClick={() => {
                           setSearchParams({ role: role });
                           setShowRoleFilter(false);
                         }}
                      >
                         {role === "ALL" ? "All Roles" : role.replace('_', ' ')}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-xl shadow-sm overflow-visible animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        <div className="w-full">
          {filteredUsers.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center space-y-3 bg-gray-50/50 dark:bg-zinc-900/50">
              <span className="text-gray-400 dark:text-zinc-600">
                <User className="w-10 h-10 stroke-[1.5]" />
              </span>
              <span className="text-[13px] font-medium text-gray-500 dark:text-zinc-400">
                No users found matching your search or filters.
              </span>
            </div>
          ) : (
            <table className="w-full table-fixed border-collapse text-left">
                <thead>
                  <tr className="bg-blue-50 dark:bg-zinc-900 border-b border-blue-100 dark:border-zinc-800">
                    <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 w-[240px] rounded-tl-xl">User Profile</th>
                    <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 text-left w-40">Role</th>
                    <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 text-left w-40">Status</th>
                    <th className="hidden lg:table-cell text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 text-left">Account Details</th>
                    <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 text-right w-24 rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => {
                  const statusStyle = getStatusStyle(user.is_active);
                  const roleStyle = getRoleStyle(user.role);
                  
                  return (
                    <tr 
                      key={user.id} 
                      className="transition-colors duration-150 border-b border-gray-100 dark:border-zinc-800/60 last:border-b-0 hover:bg-gray-50/40 dark:hover:bg-zinc-900/35 group"
                    >
                      <td className="py-2.5 px-6 text-left">
                        <div className="flex items-center gap-3">
                          {user.profile_picture ? (
                            <img 
                              src={user.profile_picture} 
                              alt={user.username || user.email} 
                              className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-zinc-700 shadow-sm"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center border border-gray-200 dark:border-zinc-700 shadow-sm">
                               {user.role === 'ADMIN_UNIV' ? (
                                 <GraduationCap className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                               ) : user.role === 'COMPANY' ? (
                                 <Building2 className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                               ) : (
                                 <User className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                               )}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-semibold text-gray-900 dark:text-zinc-100 truncate">
                              {user.role === 'COMPANY'
                                ? (user.name || user.username)
                                : user.role === 'STUDENT' && (user.first_name || user.last_name)
                                  ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                  : user.username || user.email.split('@')[0]}
                            </span>
                            <span className="text-[11px] font-medium text-gray-500 dark:text-zinc-400 font-mono">
                              UID: {user.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-2.5 px-6 text-left">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${roleStyle.bg}`}>
                          {roleStyle.label}
                        </span>
                      </td>

                      <td className="py-2.5 px-6 text-left">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${statusStyle.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot.split(' ')[0]}`} />
                          {statusStyle.label}
                        </div>
                      </td>

                      <td className="hidden lg:table-cell py-2.5 px-6 text-left text-[12px] font-medium text-gray-600 dark:text-zinc-300">
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="flex items-center gap-1.5 min-w-0">
                            <Mail className="h-3 w-3 text-gray-400 shrink-0" /> 
                            <span className="truncate">{user.email}</span>
                          </span>
                          {user.university_name && (
                            <span className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-zinc-400 min-w-0">
                              <GraduationCap className="h-3 w-3 text-gray-400 shrink-0" /> 
                              <span className="truncate" title={user.university_name}>{user.university_name}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-2.5 px-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors focus:outline-none">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 p-1.5 shadow-lg rounded-xl border border-gray-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-850">
                            <div className="px-2 py-1.5 text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                              Account Actions
                            </div>
                            <DropdownMenuItem
                              className="cursor-pointer gap-2 text-xs font-semibold rounded-lg py-1.5 focus:bg-gray-50 dark:focus:bg-zinc-800 text-gray-700 dark:text-zinc-200"
                              onClick={() => handleToggleStatus(user)}
                            >
                              {user.is_active ? (
                                <>
                                  <UserX className="h-3.5 w-3.5 text-orange-500" />
                                  <span>Deactivate Account</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                                  <span>Activate Account</span>
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-1 border-gray-100 dark:border-zinc-800" />

                            <DropdownMenuItem
                              className="cursor-pointer gap-2 text-xs font-semibold rounded-lg py-1.5 text-red-600 dark:text-red-400 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/30"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Permanently Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
            <span>Users per page</span>
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
    </div>
  );
}
