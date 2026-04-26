import React, { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash, 
  CheckCircle, 
  Clock, 
  Archive,
  AlertCircle
} from "lucide-react";
import api from "@/api/api";
import CreateOfferModal from "./CreateOfferModal";

const STATUS_CONFIG = {
  DRAFT: { label: "Draft", variant: "outline", icon: Clock },
  OPEN_FOR_APPLICATION: { label: "Open", variant: "success", icon: CheckCircle },
  CLOSED_FOR_APPLICATION: { label: "Closed", variant: "secondary", icon: Archive },
  ONGOING: { label: "Ongoing", variant: "purple", icon: Clock },
  FINISHED: { label: "Finished", variant: "outline", icon: Archive },
  CANCELLED: { label: "Cancelled", variant: "destructive", icon: AlertCircle },
  ARCHIVED: { label: "Archived", variant: "secondary", icon: Archive },
};

export default function CompanyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOffer, setEditingOffer] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setIsEditModalOpen(true);
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      
      // 1. Get current user profile to know the role and ID
      const profileRes = await api.get("/auth/profile/");
      const currentUser = profileRes.data;
      const companyId = currentUser.id;
      const isAdmin = currentUser.role === 'ADMIN';
      
      console.log("Current User:", currentUser);
      
      // 2. Use the correct endpoint:
      // - Companies should use /internships/company/ to see drafts
      // - Admins can use /internships/ to see everything
      const endpoint = currentUser.role === 'COMPANY' ? "/internships/company/" : "/internships/";
      const res = await api.get(endpoint);
      
      console.log("Fetched Data:", res.data);
      
      const rawData = res.data.results || res.data;
      const listingsData = Array.isArray(rawData) ? rawData : [];
      
      // 3. Filter and map
      const filtered = listingsData
        .filter(item => {
          // If admin, show everything. If company, the backend already filtered but we double-check.
          return isAdmin || item.company == companyId;
        })
        .map(item => {
          // Map skills from JSON string or array
          let skills = [];
          if (item.internship_skills) {
            try {
              // Handle if it's already an array or a JSON string
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

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/internships/${id}/update/`, { status: newStatus });
      fetchListings(); // Refresh list
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status.");
    }
  };

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium">
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </Badge>
    );
  };

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
        <h1 className="text-3xl font-bold tracking-tight">My Internship Listings</h1>
        <p className="text-muted-foreground">Manage your posted internship opportunities and track their status.</p>
      </div>

      <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle>All Listings</CardTitle>
          <CardDescription>
            You have {listings.length} internship offers posted.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px]">Internship Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Positions</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No listings found. Create your first offer to see it here!
                    </TableCell>
                  </TableRow>
                ) : (
                  listings.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors group">
                      <TableCell className="font-semibold">
                        <div className="flex flex-col gap-0.5">
                          <span>{item.title}</span>
                          <span className="text-[10px] text-muted-foreground font-mono uppercase">ID: {item.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(item.status)}
                          {item.status === 'DRAFT' && (
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="h-auto p-0 text-primary font-bold hover:no-underline"
                              onClick={() => handleUpdateStatus(item.id, "OPEN_FOR_APPLICATION")}
                            >
                              Publish Now
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <Badge variant="outline" className="font-normal capitalize">
                          {item.internship_location?.toLowerCase() || "Onsite"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {item.number_of_places}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex flex-col">
                          <span>Start: {item.offer_start_date}</span>
                          <span>End: {item.offer_end_date}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted">
                              <MoreVertical className="h-5 w-5" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 p-2">
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => window.open(`/internships/${item.id}`, "_blank")}
                            >
                              <Eye className="mr-3 h-4 w-4 text-muted-foreground" />
                              <span>View Public Page</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="mr-3 h-4 w-4 text-muted-foreground" />
                              <span>Edit Details</span>
                            </DropdownMenuItem>
                            
                            <div className="h-px bg-muted my-2" />
                            <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              Change Status
                            </div>
                            
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => handleUpdateStatus(item.id, "OPEN_FOR_APPLICATION")}
                            >
                              <CheckCircle className="mr-3 h-4 w-4 text-green-500" />
                              <span>Open for Applications</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => handleUpdateStatus(item.id, "ONGOING")}
                            >
                              <Clock className="mr-3 h-4 w-4 text-blue-500" />
                              <span>Mark as Ongoing</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => handleUpdateStatus(item.id, "CLOSED_FOR_APPLICATION")}
                            >
                              <Archive className="mr-3 h-4 w-4 text-orange-500" />
                              <span>Close Applications</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => handleUpdateStatus(item.id, "FINISHED")}
                            >
                              <CheckCircle className="mr-3 h-4 w-4 text-slate-500" />
                              <span>Mark as Finished</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => handleUpdateStatus(item.id, "ARCHIVED")}
                            >
                              <Archive className="mr-3 h-4 w-4 text-slate-500" />
                              <span>Archive Listing</span>
                            </DropdownMenuItem>
                            
                            <div className="h-px bg-muted my-2" />
                            
                            <DropdownMenuItem 
                              variant="destructive"
                              className="cursor-pointer text-destructive focus:bg-destructive/10"
                            >
                              <Trash className="mr-3 h-4 w-4" />
                              <span>Delete Offer</span>
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

      <CreateOfferModal 
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        initialData={editingOffer}
        onOfferCreated={fetchListings}
      />
    </div>
  );
}
