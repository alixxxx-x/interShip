import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Search,
  User,
  Mail,
  Shield,
  CheckCircle,
  AlertCircle,
  Archive,
  UserCheck,
  UserX,
  Trash2,
  GraduationCap,
  Building2,
  Lock,
  Building,
  UserCog
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import api from "@/api/api";
import { useToast } from "@/components/ui/custom-toast";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Get search params for role filtering
  const [searchParams] = useSearchParams();
  const roleFilter = searchParams.get("role"); // STUDENT, COMPANY, ADMIN_UNIV
  const departmentFilter = searchParams.get("department");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch with role and department query params if defined
      let url = "/users/";
      const params = [];
      if (roleFilter) params.push(`role=${roleFilter}`);
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

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = !user.is_active;
      // Optimistic update
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));

      await api.patch(`/users/${user.id}/`, { is_active: newStatus });
      toast.success(`${user.username || user.email}'s status updated successfully.`);
    } catch (error) {
      console.error("Failed to toggle status:", error);
      // Revert if failed
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

  const filteredUsers = users.filter(user =>
    user.is_active &&
    ((user.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (user.first_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (user.last_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (user.university_name || "").toLowerCase().includes(search.toLowerCase()))
  );

  // Dynamic headers based on role filter
  const getHeaderInfo = () => {
    switch (roleFilter) {
      case "STUDENT":
        return {
          title: "Student Accounts Directory",
          description: "Monitor and manage all student profiles currently registered on the platform.",
          tableTitle: "Registered Students"
        };
      case "COMPANY":
        return {
          title: "Company Accounts Directory",
          description: "Monitor and manage all corporate accounts currently registered on the platform.",
          tableTitle: "Registered Corporate Partners"
        };
      case "ADMIN_UNIV":
        return {
          title: "University Administrators",
          description: "Monitor and manage all university-level administrator accounts and access keys.",
          tableTitle: "Academic Administrators"
        };
      default:
        return {
          title: "System User Directory",
          description: "Comprehensive registry of all student, company, and university accounts registered on the platform.",
          tableTitle: "All System Accounts"
        };
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
    <div className="p-6 space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-indigo-500 to-indigo-600 bg-clip-text text-transparent">
          {headerInfo.title}
        </h1>
        <p className="text-muted-foreground text-sm">
          {headerInfo.description}
        </p>
      </div>

      <Card className="border border-border/60 shadow-xl bg-card/45 backdrop-blur-md overflow-hidden rounded-2xl">
        <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                {headerInfo.tableTitle}
              </CardTitle>
              <CardDescription className="text-xs">
                Total of {users.length} matching profile(s) found in the database.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80" />
              <Input
                placeholder="Search by name, email, university..."
                className="pl-9 bg-background/50 border border-border/80 focus:border-primary rounded-xl text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[280px] font-bold text-xs uppercase">User Profile</TableHead>
                  <TableHead className="font-bold text-xs uppercase">Security Role</TableHead>
                  <TableHead className="font-bold text-xs uppercase">Security Status</TableHead>
                  <TableHead className="font-bold text-xs uppercase">Account Details</TableHead>
                  <TableHead className="text-right font-bold text-xs uppercase">Operational Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <User className="w-9 h-9 text-muted-foreground/30" />
                        <span className="text-sm font-semibold">No accounts found</span>
                        <span className="text-xs text-muted-foreground/60">No user directory matches found for your active filter.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/10 transition-colors group">

                      {/* Avatar & Username */}
                      <TableCell className="font-bold py-4">
                        <div className="flex items-center gap-3">
                          {user.profile_picture ? (
                            <img
                              src={user.profile_picture}
                              alt={user.username || user.email}
                              className="w-10 h-10 rounded-full object-cover border border-border/80 shadow-sm"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                              {user.role === 'ADMIN_UNIV' ? (
                                <GraduationCap className="w-5 h-5 text-primary" />
                              ) : user.role === 'COMPANY' ? (
                                <Building2 className="w-5 h-5 text-indigo-500" />
                              ) : (
                                <User className="w-5 h-5 text-teal-600" />
                              )}
                            </div>
                          )}
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm text-foreground font-bold tracking-tight">
                              {user.role === 'COMPANY'
                                ? (user.name || user.username)
                                : user.role === 'STUDENT' && (user.first_name || user.last_name)
                                  ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                  : user.username || user.email.split('@')[0]}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono font-semibold">UID: {user.id}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Role Badge */}
                      <TableCell className="py-4">
                        <Badge variant="outline" className="capitalize px-2.5 py-0.5 rounded-lg font-bold border-indigo-200 text-indigo-600 bg-indigo-50 text-[10px]">
                          {user.role === 'ADMIN_UNIV'
                            ? "University Admin"
                            : user.role === 'ADMIN_DEPT'
                              ? "Department Admin"
                              : user.role?.toLowerCase().replace('_', ' ')}
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-4">
                        <Badge variant={user.is_active ? "success" : "destructive"} className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] w-fit">
                          {user.is_active ? (
                            <>
                              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                              Active Account
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                              Deactivated
                            </>
                          )}
                        </Badge>
                      </TableCell>

                      {/* Account Details */}
                      <TableCell className="py-4 text-xs text-muted-foreground font-medium">
                        <div className="flex flex-col gap-1.5">
                          <span className="flex items-center gap-1.5 text-foreground/80 font-semibold">
                            <Mail className="h-3.5 w-3.5 text-primary/70" /> {user.email}
                          </span>

                          {/* Optional University Name display */}
                          {user.university_name && (
                            <span className="flex items-center gap-1.5 text-[10px]">
                              <GraduationCap className="h-3.5 w-3.5 text-indigo-500/70" /> {user.university_name}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted focus-visible:ring-0">
                              <MoreVertical className="h-5 w-5 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-2xl rounded-xl border border-border/80 bg-card/90 backdrop-blur-md">
                            <div className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              Account Security
                            </div>
                            <DropdownMenuItem
                              className="cursor-pointer gap-2.5 text-sm rounded-lg py-2 focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => handleToggleStatus(user)}
                            >
                              {user.is_active ? (
                                <>
                                  <UserX className="h-4 w-4 text-orange-500" />
                                  <span>Deactivate Account</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 text-green-500" />
                                  <span>Activate Account</span>
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-1.5 border-border/60" />

                            <DropdownMenuItem
                              className="cursor-pointer gap-2.5 text-sm rounded-lg py-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Permanently Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>

                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
