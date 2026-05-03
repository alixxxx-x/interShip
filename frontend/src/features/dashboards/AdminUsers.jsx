import { useEffect, useState } from "react";
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
  UserX
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

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/");
      setUsers(res.data.results || res.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = !user.is_active;
      // Optimistic update
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
      
      await api.patch(`/users/${user.id}/`, { is_active: newStatus });
    } catch (error) {
      console.error("Failed to toggle status:", error);
      // Revert if failed
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: user.is_active } : u));
      toast.error("Failed to update user status.");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await api.delete(`/users/${id}/`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user.");
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-10 w-64 bg-muted animate-pulse rounded-lg" />
        <div className="h-[400px] w-full bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Monitor and manage all student and company accounts across the platform.</p>
      </div>

      <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>All Accounts</CardTitle>
              <CardDescription>
                Total of {users.length} users registered in the system.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or email..." 
                className="pl-9 bg-muted/20 border-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px]">User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Account Details</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No users found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/30 transition-colors group">
                      <TableCell className="font-semibold">
                        <div className="flex items-center gap-3">
                          {user.profile_picture ? (
                            <img 
                              src={user.profile_picture} 
                              alt={user.username} 
                              className="w-10 h-10 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                          )}
                          <div className="flex flex-col gap-0.5">
                            <span>{user.username}</span>
                            <span className="text-[10px] text-muted-foreground font-mono uppercase">UID: {user.id}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize px-2 py-0.5 rounded-full font-medium border-primary/20 text-primary bg-primary/5">
                            {user.role?.toLowerCase().replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "success" : "destructive"} className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium w-fit">
                          {user.is_active ? (
                            <>
                              <CheckCircle className="h-3.5 w-3.5" />
                              Active
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3.5 w-3.5" />
                              Deactivated
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {user.email}</span>
                          <span className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> Joined: {new Date().toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted focus-visible:ring-0">
                              <MoreVertical className="h-5 w-5 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 p-2 shadow-2xl">
                            <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              User Controls
                            </div>
                            <DropdownMenuItem 
                              className="cursor-pointer gap-3"
                              onClick={() => handleToggleStatus(user)}
                            >
                              {user.is_active ? (
                                <UserX className="h-4 w-4 text-orange-500" />
                              ) : (
                                <UserCheck className="h-4 w-4 text-green-500" />
                              )}
                              <span>{user.is_active ? "Deactivate Account" : "Activate Account"}</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="my-1.5" />
                            
                            <DropdownMenuItem 
                              className="cursor-pointer gap-3 text-amber-600 focus:text-amber-600 focus:bg-amber-50"
                              onClick={() => handleToggleStatus(user)}
                            >
                              <Archive className="h-4 w-4" />
                              <span>Archive Account</span>
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
