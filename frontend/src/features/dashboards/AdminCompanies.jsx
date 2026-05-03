import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  MapPin, 
  Globe, 
  Search, 
  MoreVertical,
  Archive,
  UserCheck,
  UserX,
  MessageSquare
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import api from "@/api/api";
import ChatModal from "./ChatModal";

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [activeRecipient, setActiveRecipient] = useState(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get("/companies/");
      setCompanies(res.data.results || res.data);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleToggleStatus = async (company) => {
    try {
      const newStatus = !company.is_active;
      // Optimistic update
      setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, is_active: newStatus } : c));
      
      await api.patch(`/users/${company.id}/`, { is_active: newStatus });
    } catch (error) {
      console.error("Failed to toggle status:", error);
      // Revert if failed
      setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, is_active: company.is_active } : c));
      alert("Failed to update company status.");
    }
  };

  const filteredCompanies = companies.filter(company => 
    company.name?.toLowerCase().includes(search.toLowerCase()) ||
    company.location?.toLowerCase().includes(search.toLowerCase()) ||
    company.company_field?.toLowerCase().includes(search.toLowerCase())
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
        <h1 className="text-3xl font-bold tracking-tight">Company Directory</h1>
        <p className="text-muted-foreground">Manage and monitor all organizations registered on the platform.</p>
      </div>

      <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Partner Companies</CardTitle>
              <CardDescription>
                Overview of {companies.length} active corporate partners.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search companies..." 
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
                  <TableHead className="w-[300px]">Organization</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No companies found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id} className="hover:bg-muted/30 transition-colors group">
                      <TableCell className="font-semibold">
                        <div className="flex items-center gap-3">
                          {company.logo ? (
                            <img 
                              src={company.logo} 
                              alt={company.name} 
                              className="w-10 h-10 rounded-lg object-cover border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                          )}
                          <div className="flex flex-col gap-0.5">
                            <span>{company.name}</span>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono uppercase">
                              <span>ID: {company.id}</span>
                              {company.website && (
                                <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 hover:text-primary transition-colors">
                                  <Globe className="h-2.5 w-2.5" /> Site
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="px-2 py-0.5 rounded-full font-medium border-primary/20 text-primary bg-primary/5">
                          {company.company_field || "Technology"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {company.location || "Not specified"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={company.is_active ? "success" : "destructive"} className="px-2.5 py-0.5 rounded-full font-medium">
                          {company.is_active ? "Active Partner" : "Inactive"}
                        </Badge>
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
                              Company Controls
                            </div>
                            <DropdownMenuItem 
                              className="cursor-pointer gap-3"
                              onClick={() => handleToggleStatus(company)}
                            >
                              {company.is_active ? (
                                <UserX className="h-4 w-4 text-orange-500" />
                              ) : (
                                <UserCheck className="h-4 w-4 text-green-500" />
                              )}
                              <span>{company.is_active ? "Deactivate Partner" : "Activate Partner"}</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="my-1.5" />
                            
                            <DropdownMenuItem 
                              className="cursor-pointer gap-3"
                              onClick={() => {
                                setActiveRecipient(company);
                                setChatOpen(true);
                              }}
                            >
                              <MessageSquare className="h-4 w-4 text-blue-500" />
                              <span>Direct Chat</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-1.5" />
                            
                            <DropdownMenuItem 
                              className="cursor-pointer gap-3 text-amber-600 focus:text-amber-600 focus:bg-amber-50"
                              onClick={() => handleToggleStatus(company)}
                            >
                              <Archive className="h-4 w-4" />
                              <span>Archive Organization</span>
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

      <ChatModal 
        open={chatOpen} 
        onOpenChange={setChatOpen} 
        recipientId={activeRecipient?.id}
        recipientName={activeRecipient?.name}
      />
    </div>
  );
}
