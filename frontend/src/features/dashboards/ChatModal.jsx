import { useState, useEffect, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User } from "lucide-react";
import api from "@/api/api";
import { cn } from "@/lib/utils";

export default function ChatModal({ open, onOpenChange, recipientId, recipientName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const fetchMessages = async () => {
    if (!recipientId) return;
    try {
      const res = await api.get(`/messages/?recipient_id=${recipientId}`);
      setMessages(res.data.results || res.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  useEffect(() => {
    if (open && recipientId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [open, recipientId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setLoading(true);
      const res = await api.post("/messages/send/", {
        recipient: recipientId,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] h-[600px] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold">{recipientName}</p>
              <p className="text-[10px] text-muted-foreground">Direct Message</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg) => {
              const isMe = msg.sender !== recipientId;
              return (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex flex-col max-w-[80%] gap-1",
                    isMe ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "px-3 py-2 rounded-2xl text-sm shadow-sm",
                    isMe 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-muted rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground px-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2 bg-muted/20">
          <Input 
            placeholder="Type your message..." 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="bg-background border-none shadow-none focus-visible:ring-1"
          />
          <Button type="submit" size="icon" disabled={loading || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
