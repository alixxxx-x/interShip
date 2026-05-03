import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  MessageSquare, 
  Building2,
  Send,
  Clock
} from "lucide-react";
import api from "@/api/api";
import { cn } from "@/lib/utils";

export default function StudentMessages() {
  const [conversations, setConversations] = useState([]);
  const [activeRecipient, setActiveRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch companies where the student has applied
  const fetchConversations = async () => {
    try {
      const res = await api.get("/applications/");
      const apps = res.data.results || res.data;
      
      // Extract unique companies from applications
      const uniqueCompanies = [];
      const companyIds = new Set();
      
      apps.forEach(app => {
        if (app.internship?.company && !companyIds.has(app.internship.company.id)) {
          companyIds.add(app.internship.company.id);
          uniqueCompanies.push({
            id: app.internship.company.id,
            name: app.internship.company.name,
            email: app.internship.company.email,
            field: app.internship.company.company_field || "Partner Company",
            internship: app.internship?.title
          });
        }
      });
      
      // 2. Fetch admins
      const adminRes = await api.get("/users/?role=ADMIN");
      const admins = adminRes.data.results || adminRes.data;
      
      const adminContacts = admins.map(admin => ({
        id: admin.id,
        name: `Admin (${admin.username || admin.email})`,
        email: admin.email,
        field: "Platform Support",
        isAdmin: true
      }));
      
      setConversations([...adminContacts, ...uniqueCompanies]);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  };

  const fetchMessages = async (recipientId) => {
    if (!recipientId) return;
    try {
      const res = await api.get(`/messages/?recipient_id=${recipientId}`);
      setMessages(res.data.results || res.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeRecipient) {
      fetchMessages(activeRecipient.id);
      const interval = setInterval(() => fetchMessages(activeRecipient.id), 5000);
      return () => clearInterval(interval);
    }
  }, [activeRecipient]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRecipient) return;

    try {
      setLoading(true);
      const res = await api.post("/messages/send/", {
        recipient: activeRecipient.id,
        content: newMessage
      });
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 h-[calc(100vh-100px)] flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Chat with companies you've applied to.</p>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Sidebar: Company List */}
        <Card className="w-80 flex flex-col border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search companies..." 
                className="pl-9 bg-muted/20 border-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredConversations.map((company) => (
              <button
                key={company.id}
                onClick={() => setActiveRecipient(company)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                  activeRecipient?.id === company.id 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "hover:bg-muted"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center border",
                  activeRecipient?.id === company.id ? "bg-white/20 border-white/20" : "bg-primary/10 border-primary/20"
                )}>
                  {company.isAdmin ? (
                    <MessageSquare className={cn("h-5 w-5", activeRecipient?.id === company.id ? "text-white" : "text-primary")} />
                  ) : (
                    <Building2 className={cn("h-5 w-5", activeRecipient?.id === company.id ? "text-white" : "text-primary")} />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold truncate">{company.name}</p>
                  <p className={cn(
                    "text-[10px] truncate",
                    activeRecipient?.id === company.id ? "text-white/70" : "text-muted-foreground"
                  )}>
                    {company.field}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Main: Chat Window */}
        <Card className="flex-1 flex flex-col border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
          {activeRecipient ? (
            <>
              <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{activeRecipient.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5 text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Active Conversation
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/5">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4 opacity-50">
                    <MessageSquare className="h-12 w-12" />
                    <p className="text-sm font-medium">No messages yet. Say hi!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_email !== activeRecipient.email;
                    return (
                      <div 
                        key={msg.id} 
                        className={cn(
                          "flex flex-col max-w-[70%] gap-1",
                          isMe ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                      >
                        <div className={cn(
                          "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                          isMe 
                            ? "bg-primary text-primary-foreground rounded-tr-none shadow-primary/20" 
                            : "bg-background rounded-tl-none border shadow-sm"
                        )}>
                          {msg.content}
                        </div>
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground px-1 uppercase tracking-tighter">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 bg-background border-t flex gap-3">
                <Input 
                  placeholder="Write a message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-muted/20 border-none shadow-none focus-visible:ring-1 h-11"
                />
                <Button type="submit" size="icon" className="h-11 w-11 shadow-lg shadow-primary/20" disabled={loading || !newMessage.trim()}>
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-6 p-12 text-center">
              <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center border-2 border-dashed border-primary/20">
                <MessageSquare className="h-10 w-10 text-primary/30" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">Select a Company</h3>
                <p className="max-w-[300px]">Choose an organization from the left sidebar to start direct communication.</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
