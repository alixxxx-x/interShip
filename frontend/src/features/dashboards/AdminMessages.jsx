import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  MessageSquare,
  User as UserIcon,
  Send,
  Building2,
  Clock,
  CheckCheck,
  Check,
  Pencil,
  Trash2,
  X,
  MoreVertical,
  Reply,
  Smile
} from "lucide-react";
import api from "@/api/api";
import { cn } from "@/lib/utils";
import { ACCESS_TOKEN } from "@/constants";

export default function AdminMessages() {
  const [conversations, setConversations] = useState([]);
  const [activeRecipient, setActiveRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeConversationIds, setActiveConversationIds] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});
  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const [isRecipientOnline, setIsRecipientOnline] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openEmojiId, setOpenEmojiId] = useState(null);
  const [openInputEmoji, setOpenInputEmoji] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setOpenInputEmoji(false);
      }
      if (!event.target.closest('.menu-container') && !event.target.closest('.emoji-container')) {
        setOpenMenuId(null);
        setOpenEmojiId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkUnreadStatus = async () => {
    try {
      const profileRes = await api.get("/auth/profile/");
      const userProfile = profileRes.data;
      const msgsRes = await api.get("/messages/");
      const messagesList = msgsRes.data.results || msgsRes.data;
      
      const hasUnread = messagesList.some(
        msg => msg.recipient === userProfile.id && !msg.is_read
      );
      window.dispatchEvent(new CustomEvent('messagesUpdated', { detail: { hasUnread } }));

      // Compute unread counts per sender ID
      const counts = {};
      messagesList.forEach(msg => {
        if (msg.recipient === userProfile.id && !msg.is_read) {
          const senderId = msg.sender;
          counts[senderId] = (counts[senderId] || 0) + 1;
        }
      });
      setUnreadCounts(counts);
    } catch (err) {
      console.error("Failed to check unread status:", err);
    }
  };

  // Fetch all companies and department students to start a conversation
  const fetchConversations = async () => {
    try {
      // 1. Get logged in user profile
      const profileRes = await api.get("/auth/profile/");
      const userProfile = profileRes.data;

      // 2. Fetch all messages to find active conversations
      const messagesRes = await api.get("/messages/");
      const allUserMessages = messagesRes.data.results || messagesRes.data;

      const activeIds = new Set();
      const counts = {};
      allUserMessages.forEach(msg => {
        if (msg.sender !== userProfile.id) activeIds.add(msg.sender);
        if (msg.recipient !== userProfile.id) activeIds.add(msg.recipient);

        if (msg.recipient === userProfile.id && !msg.is_read) {
          const senderId = msg.sender;
          counts[senderId] = (counts[senderId] || 0) + 1;
        }
      });
      setActiveConversationIds(activeIds);
      setUnreadCounts(counts);

      // Check initially on load
      const hasUnread = allUserMessages.some(
        msg => msg.recipient === userProfile.id && !msg.is_read
      );
      window.dispatchEvent(new CustomEvent('messagesUpdated', { detail: { hasUnread } }));

      // 3. Fetch companies
      const companiesRes = await api.get("/companies/");
      const companies = (companiesRes.data.results || companiesRes.data).map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        subtitle: c.company_field || "Partner Organization",
        isCompany: true,
        type: 'company'
      }));

      let contactsList = [...companies];

      // 4. If ADMIN_DEPT, fetch their department's students
      if (userProfile.role === 'ADMIN_DEPT') {
        const dept = userProfile.department || "";
        const studentsRes = await api.get("/users/?role=STUDENT");
        const students = (studentsRes.data.results || studentsRes.data).map(s => ({
          id: s.id,
          name: `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.username || s.email,
          email: s.email,
          subtitle: `Student (${s.department || dept})`,
          isStudent: true,
          type: 'student'
        }));
        contactsList = [...students, ...companies];
      }

      setConversations(contactsList);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  };

  const fetchMessages = async (recipientId) => {
    if (!recipientId) return;
    try {
      const res = await api.get(`/messages/?recipient_id=${recipientId}`);
      setMessages(res.data.results || res.data);
      // Recheck unread status since we read these messages
      checkUnreadStatus();
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

      const token = localStorage.getItem(ACCESS_TOKEN);
      // Use wss:// in production, but ws:// for development
      const wsUrl = `ws://127.0.0.1:8000/ws/chat/?recipient_id=${activeRecipient.id}&token=${token}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'user_status') {
          if (data.user_id === activeRecipient.id) {
            setIsRecipientOnline(data.status === 'online');
          }
          return;
        }

        if (data.type === 'message_deleted') {
          setMessages(prev => prev.filter(msg => msg.id !== data.message_id));
          return;
        }

        if (data.type === 'message_edited') {
          setMessages(prev => prev.map(msg => 
            msg.id === data.message_id ? { ...msg, content: data.content } : msg
          ));
          return;
        }

        if (data.type === 'read_receipt') {
          if (data.reader_id === activeRecipient.id) {
            setMessages(prev => prev.map(msg => 
              msg.sender_email !== activeRecipient.email ? { ...msg, is_read: true } : msg
            ));
          }
          return;
        }

        const newMsg = {
          id: data.id || Date.now(),
          content: data.message || data.content,
          sender_email: data.sender_email,
          created_at: data.created_at || new Date().toISOString(),
          is_read: false
        };
        setMessages(prev => [...prev, newMsg]);

        // Add to active conversations dynamically when message is received
        setActiveConversationIds(prev => {
          const next = new Set(prev);
          next.add(activeRecipient.id);
          return next;
        });

        // Trigger real-time sidebar dot update on message receive
        checkUnreadStatus();
      };

      return () => {
        if (ws.current) {
          ws.current.close();
        }
      };
    }
  }, [activeRecipient]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRecipient) return;

    let finalContent = newMessage;
    if (replyingTo) {
      const replyOriginalText = replyingTo.content.split('|REACT:')[0].split('|ENDREPLY|').pop();
      finalContent = `|REPLY:${replyOriginalText}|ENDREPLY|${newMessage}`;
    }

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        message: finalContent
      }));
      
      // Add to active conversations dynamically when sending a message
      setActiveConversationIds(prev => {
        const next = new Set(prev);
        next.add(activeRecipient.id);
        return next;
      });

      setNewMessage("");
      setReplyingTo(null);
      // Recheck status
      setTimeout(checkUnreadStatus, 500);
    }
  };

  const handleEditMessage = async (msgId, newContent) => {
    try {
      await api.patch(`/messages/${msgId}/`, { content: newContent });
      setEditingMessageId(null);
    } catch (error) {
      console.error("Failed to edit message:", error);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await api.delete(`/messages/${msgId}/`);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase());
    if (search.trim() !== "") {
      return matchesSearch;
    } else {
      // If search is empty, only show active conversations or the currently selected contact
      return activeConversationIds.has(c.id) || (activeRecipient?.id === c.id && activeRecipient?.type === c.type);
    }
  });

  return (
    <div className="p-6 h-[calc(100vh-100px)] flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Direct communication channel with partner organizations and department students.</p>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Sidebar: Contact List */}
        <Card className="w-80 flex flex-col border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                className="pl-9 bg-muted/20 border-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground opacity-70">
                {search.trim() !== "" ? "No contacts match search" : "No active chats yet. Use search to find a contact!"}
              </div>
            ) : (
              filteredConversations.map((contact) => (
                <button
                  key={`${contact.type}-${contact.id}`}
                  onClick={() => setActiveRecipient(contact)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                    activeRecipient?.id === contact.id && activeRecipient?.type === contact.type
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "hover:bg-muted"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center border",
                    activeRecipient?.id === contact.id && activeRecipient?.type === contact.type ? "bg-white/20 border-white/20" : "bg-primary/10 border-primary/20"
                  )}>
                    {contact.isStudent ? (
                      <UserIcon className={cn("h-5 w-5", activeRecipient?.id === contact.id && activeRecipient?.type === contact.type ? "text-white" : "text-primary")} />
                    ) : (
                      <Building2 className={cn("h-5 w-5", activeRecipient?.id === contact.id && activeRecipient?.type === contact.type ? "text-white" : "text-primary")} />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold truncate">{contact.name}</p>
                    <p className={cn(
                      "text-[10px] truncate",
                      activeRecipient?.id === contact.id && activeRecipient?.type === contact.type ? "text-white/70" : "text-muted-foreground"
                    )}>
                      {contact.subtitle}
                    </p>
                  </div>
                  {unreadCounts[contact.id] > 0 && (
                    <span className={cn(
                      "h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold",
                      activeRecipient?.id === contact.id && activeRecipient?.type === contact.type
                        ? "bg-white text-primary"
                        : "bg-primary text-primary-foreground"
                    )}>
                      {unreadCounts[contact.id]}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Main: Chat Window */}
        <Card className="flex-1 flex flex-col border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
          {activeRecipient ? (
            <>
              <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                    {activeRecipient.isStudent ? (
                      <UserIcon className="h-5 w-5 text-primary" />
                    ) : (
                      <Building2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{activeRecipient.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5 text-[10px]">
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isRecipientOnline ? "bg-green-500 animate-pulse" : "bg-muted-foreground/55"
                      )} />
                      {isRecipientOnline ? "Online" : "Offline"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/5">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4 opacity-50">
                    <MessageSquare className="h-12 w-12" />
                    <p className="text-sm font-medium">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_email !== activeRecipient.email;
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex flex-col gap-1 max-w-[70%] group",
                          isMe ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                      >
                        {/* 1. Reply bubble on top */}
                        {(() => {
                            let textToRender = msg.content.split('|REACT:')[0];
                            let replyPart = null;
                            if (textToRender.startsWith('|REPLY:')) {
                              const endIdx = textToRender.indexOf('|ENDREPLY|');
                              if (endIdx !== -1) {
                                replyPart = textToRender.substring(7, endIdx);
                              }
                            }
                            if (!replyPart) return null;
                            return (
                              <div className={cn("flex flex-col gap-0.5 mb-1 px-1", isMe ? "items-end ml-auto" : "items-start mr-auto")}>
                                <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                  {isMe ? `You replied to ${activeRecipient?.name || activeRecipient?.first_name || activeRecipient?.email?.split('@')[0] || 'message'}` : `${activeRecipient?.name || activeRecipient?.first_name || activeRecipient?.email?.split('@')[0] || 'User'} replied to you`}
                                </span>
                                <div className="px-3 py-1.5 rounded-2xl text-[13px] bg-muted text-muted-foreground truncate max-w-[250px] shadow-sm border border-border/40">
                                  {replyPart}
                                </div>
                              </div>
                            );
                        })()}

                        {/* 2. Main bubble + action icons + timestamp */}
                        <div className={cn("flex items-end gap-1.5", isMe ? "flex-row-reverse ml-auto" : "flex-row mr-auto")}>
                          {/* Vertical Container for Bubble & Timestamp */}
                          <div className={cn("flex flex-col gap-0.5", isMe ? "items-end ml-auto" : "items-start mr-auto")}>
                            <div className="relative">
                              <div className={cn(
                                "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                                isMe
                                  ? "bg-primary text-primary-foreground shadow-primary/20"
                                  : "bg-background border shadow-sm"
                              )}>
                                {editingMessageId === msg.id ? (
                                  <div className="flex items-center gap-2 min-w-[200px]">
                                    <Input
                                      value={editingText}
                                      onChange={(e) => setEditingText(e.target.value)}
                                      className="h-7 py-0 px-2 text-xs bg-white/10 text-inherit border-none focus-visible:ring-1 focus-visible:ring-white/40 focus-visible:ring-offset-0 rounded-lg"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const currentReaction = msg.content.split('|REACT:')[1];
                                            let originalText = msg.content.split('|REACT:')[0];
                                            let replyPrefix = "";
                                            if (originalText.startsWith('|REPLY:')) {
                                                const endIdx = originalText.indexOf('|ENDREPLY|');
                                                if (endIdx !== -1) {
                                                    replyPrefix = originalText.substring(0, endIdx + 10);
                                                }
                                            }
                                            const baseText = replyPrefix + editingText;
                                            const finalContent = currentReaction ? baseText + '|REACT:' + currentReaction : baseText;
                                            handleEditMessage(msg.id, finalContent);
                                        }
                                        if (e.key === 'Escape') setEditingMessageId(null);
                                      }}
                                    />
                                    <button onClick={() => {
                                        const currentReaction = msg.content.split('|REACT:')[1];
                                        let originalText = msg.content.split('|REACT:')[0];
                                        let replyPrefix = "";
                                        if (originalText.startsWith('|REPLY:')) {
                                            const endIdx = originalText.indexOf('|ENDREPLY|');
                                            if (endIdx !== -1) {
                                                replyPrefix = originalText.substring(0, endIdx + 10);
                                            }
                                        }
                                        const baseText = replyPrefix + editingText;
                                        const finalContent = currentReaction ? baseText + '|REACT:' + currentReaction : baseText;
                                        handleEditMessage(msg.id, finalContent);
                                    }} className="p-1 text-green-300 hover:text-green-200">
                                      <Check className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => setEditingMessageId(null)} className="p-1 text-red-300 hover:text-red-200">
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <div>{msg.content.split('|REACT:')[0].startsWith('|REPLY:') ? msg.content.split('|REACT:')[0].split('|ENDREPLY|').pop() : msg.content.split('|REACT:')[0]}</div>
                                )}
                              </div>
                              {msg.content.includes('|REACT:') && (
                                <div className={cn(
                                  "absolute -bottom-2.5 w-5 h-5 bg-muted border shadow-sm rounded-full flex items-center justify-center text-[10px] z-10",
                                  isMe ? "left-0 -translate-x-1/4" : "right-0 translate-x-1/4"
                                )}>
                                  {msg.content.split('|REACT:')[1]}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1 text-[9px] text-muted-foreground px-1 uppercase tracking-tighter mt-1">
                              {isMe && (
                                msg.is_read ? <CheckCheck className="h-3 w-3 text-blue-400" /> : <Check className="h-3 w-3" />
                              )}
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>

                          {/* Action Icons */}
                          {!editingMessageId && (
                            <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-all duration-150 mb-5 shrink-0 relative">
                              {isMe && (
                                <div className="relative menu-container">
                                  <button
                                    onClick={() => setOpenMenuId(openMenuId === msg.id ? null : msg.id)}
                                    className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    title="More"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </button>
                                  {openMenuId === msg.id && (
                                    <div className="absolute bottom-9 left-0 z-50 bg-popover border border-border rounded-xl shadow-xl overflow-hidden min-w-[120px]">
                                      <button
                                        onClick={() => {
                                          setEditingMessageId(msg.id);
                                          let textToEdit = msg.content.split('|REACT:')[0];
                                          if (textToEdit.startsWith('|REPLY:')) {
                                              const endIdx = textToEdit.indexOf('|ENDREPLY|');
                                              if (endIdx !== -1) {
                                                  textToEdit = textToEdit.substring(endIdx + 10);
                                              }
                                          }
                                          setEditingText(textToEdit);
                                          setOpenMenuId(null);
                                        }}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors text-foreground"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleDeleteMessage(msg.id);
                                          setOpenMenuId(null);
                                        }}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-destructive/10 text-destructive transition-colors"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Unsend
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                              <button onClick={() => setReplyingTo(msg)} className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Reply">
                                <Reply className="h-4 w-4" />
                              </button>
                              <div className="relative emoji-container">
                                <button 
                                  onClick={() => setOpenEmojiId(openEmojiId === msg.id ? null : msg.id)}
                                  className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="React">
                                  <Smile className="h-4 w-4" />
                                </button>
                                {openEmojiId === msg.id && (
                                  <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-50 bg-popover border border-border rounded-full shadow-xl overflow-hidden p-1.5 flex gap-1">
                                    {['👍', '❤️', '😂', '😮', '😢', '👏'].map(emoji => (
                                      <button 
                                        key={emoji} 
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-lg transition-colors"
                                        onClick={() => {
                                          const parts = msg.content.split('|REACT:');
                                          const baseText = parts[0];
                                          const currentReaction = parts[1];
                                          if (currentReaction === emoji) {
                                            handleEditMessage(msg.id, baseText);
                                          } else {
                                            handleEditMessage(msg.id, baseText + '|REACT:' + emoji);
                                          }
                                          setOpenEmojiId(null);
                                        }}
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex flex-col bg-background border-t">
                {replyingTo && (
                  <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-primary">Replying to {replyingTo.sender_email === activeRecipient?.email ? 'message' : 'yourself'}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">{replyingTo.content.split('|REACT:')[0].split('|ENDREPLY|').pop()}</span>
                    </div>
                    <button type="button" onClick={() => setReplyingTo(null)} className="p-1 hover:bg-muted rounded-full">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="p-4 flex gap-3 relative">
                <div className="relative flex-1">
                  <Input
                    placeholder="Write a message..."
                    autoComplete="off"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full bg-muted/20 border-none shadow-none focus-visible:ring-1 h-11 pl-10"
                  />
                  <div ref={emojiPickerRef} className="absolute left-2 top-1/2 -translate-y-1/2">
                    <button 
                      type="button"
                      onClick={() => setOpenInputEmoji(!openInputEmoji)}
                      className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                    >
                      <Smile className="h-5 w-5" />
                    </button>
                    {openInputEmoji && (
                      <div className="absolute bottom-10 left-0 bg-popover border border-border p-2 rounded-xl shadow-xl flex flex-wrap w-[220px] gap-1 z-50">
                        {['😀','😂','😅','😍','😒','😔','😘','😜','😡','😢','👍','👎','❤️','🔥','✨','🎉'].map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-md text-xl"
                            onClick={() => {
                              setNewMessage(prev => prev + emoji);
                              setOpenInputEmoji(false);
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button type="submit" size="icon" className="h-11 w-11 shadow-lg shadow-primary/20" disabled={loading || !newMessage.trim()}>
                  <Send className="h-5 w-5" />
                </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-6 p-12 text-center">
              <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center border-2 border-dashed border-primary/20">
                <MessageSquare className="h-10 w-10 text-primary/30" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">Select a Contact</h3>
                <p className="max-w-[300px]">Choose a partner organization or student from the left sidebar to start direct communication.</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
