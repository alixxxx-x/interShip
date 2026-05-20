import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  MessageSquare,
  Building2,
  Send,
  Clock,
  CheckCheck,
  Check,
  Pencil,
  Trash2,
  X,
  MoreVertical,
  Reply
} from "lucide-react";
import api from "@/api/api";
import { cn } from "@/lib/utils";
import { ACCESS_TOKEN } from "@/constants";

export default function StudentMessages() {
  const [conversations, setConversations] = useState([]);
  const [activeRecipient, setActiveRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const [isRecipientOnline, setIsRecipientOnline] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  const appleFont = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.menu-container')) {
        setOpenMenuId(null);
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

      // Fetch student profile to get their department
      const profileRes = await api.get("/auth/profile/");
      const studentProfile = profileRes.data;
      const studentDept = studentProfile.department || "";

      // 2. Fetch admins
      const adminRes = await api.get("/users/?role=ADMIN_DEPT");
      const admins = adminRes.data.results || adminRes.data;

      const adminContacts = admins
        .filter(admin => admin.role === 'ADMIN_DEPT' && admin.department === studentDept)
        .map(admin => ({
          id: admin.id,
          name: `Dept Admin (${admin.department})`,
          email: admin.email,
          field: "Department Support",
          isAdmin: true
        }));

      setConversations([...adminContacts, ...uniqueCompanies]);
      checkUnreadStatus();
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  };

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

      if (ws.current) {
        ws.current.close();
      }

      const socket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/?recipient_id=${activeRecipient.id}&token=${token}`);

      socket.onopen = () => console.log("WebSocket connected");

      socket.onmessage = (event) => {
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
          // If the active recipient read our messages, update them locally
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
        setMessages((prev) => [...prev, newMsg]);
        updateConversationOrder(activeRecipient.id);
        // Trigger dot update
        checkUnreadStatus();
      };

      socket.onclose = () => console.log("WebSocket disconnected");

      ws.current = socket;

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

      setNewMessage("");
      setReplyingTo(null);
      setTimeout(checkUnreadStatus, 500);
    } else {
      try {
        setLoading(true);
        const res = await api.post("/messages/send/", {
          recipient: activeRecipient.id,
          content: finalContent
        });
        setMessages((prev) => [...prev, res.data]);
        setNewMessage("");
        setReplyingTo(null);
        setTimeout(checkUnreadStatus, 500);
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        setLoading(false);
      }
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

  const filteredConversations = conversations.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 h-[calc(100vh-80px)] flex flex-col gap-5 bg-background animate-in fade-in duration-500" style={{ fontFamily: appleFont }}>
      <div className="flex flex-col gap-1 shrink-0">
        <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight flex items-center gap-2.5">
          Messages
        </h1>
        <p className="text-[13px] font-medium text-gray-500 dark:text-zinc-400 mt-1">
          Direct communication channel with partner organizations and your department admin.
        </p>
      </div>

      <div className="flex-1 flex gap-5 overflow-hidden">
        {/* Sidebar: Contact List */}
        <div className="w-80 flex flex-col bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-xl shadow-sm overflow-hidden shrink-0">
          <div className="p-4 border-b border-gray-150 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-zinc-900">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-255/80 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-850 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800 dark:text-zinc-200 shadow-sm"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-white dark:bg-zinc-900">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center flex flex-col items-center justify-center space-y-3">
                 <span className="text-gray-300 dark:text-zinc-700">
                    <Building2 className="w-8 h-8 stroke-[1.5]" />
                 </span>
                 <span className="text-[12px] font-medium text-gray-400 dark:text-zinc-500">
                   {search.trim() !== "" ? "No companies match search" : "No active chats yet."}
                 </span>
              </div>
            ) : (
              filteredConversations.map((company) => {
                const isActive = activeRecipient?.id === company.id;
                return (
                  <button
                    key={company.id}
                    onClick={() => setActiveRecipient(company)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left",
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/20 shadow-sm ring-1 ring-blue-100 dark:ring-blue-900/50"
                        : "hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border shadow-sm shrink-0",
                      isActive 
                        ? "bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800" 
                        : "bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                    )}>
                      {company.isAdmin ? (
                        <MessageSquare className={cn("h-4 w-4", isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-zinc-400")} />
                      ) : (
                        <Building2 className={cn("h-4 w-4", isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-zinc-400")} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-[13px] font-bold truncate", isActive ? "text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-zinc-100")}>{company.name}</p>
                      <p className={cn("text-[11px] font-medium truncate", isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-zinc-400")}>
                        {company.field}
                      </p>
                    </div>
                    {unreadCounts[company.id] > 0 && (
                      <span className="h-4 min-w-4 px-1 rounded-full flex items-center justify-center text-[9px] font-bold bg-blue-600 text-white shadow-sm">
                        {unreadCounts[company.id]}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Main: Chat Window */}
        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-xl shadow-sm overflow-hidden">
          {activeRecipient ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-150 dark:border-zinc-800/80 flex items-center gap-3 bg-white dark:bg-zinc-900 shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-zinc-800 flex items-center justify-center border border-blue-100 dark:border-zinc-700 shadow-sm">
                  {activeRecipient.isAdmin ? (
                    <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-zinc-50 tracking-tight">{activeRecipient.name}</h2>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium mt-0.5">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isRecipientOnline ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" : "bg-gray-300 dark:bg-zinc-600"
                    )} />
                    <span className={isRecipientOnline ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-zinc-400"}>
                      {isRecipientOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50/50 dark:bg-zinc-950">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-zinc-600 gap-3">
                    <MessageSquare className="h-10 w-10 stroke-[1.5]" />
                    <p className="text-[13px] font-medium text-gray-500 dark:text-zinc-400">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_email !== activeRecipient.email;
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex flex-col gap-1 max-w-[75%] group",
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
                                <span className="text-[10px] font-semibold text-gray-500 dark:text-zinc-400">
                                  {isMe ? `You replied to ${activeRecipient?.name || 'message'}` : `${activeRecipient?.name || 'User'} replied`}
                                </span>
                                <div className="px-3 py-1.5 rounded-xl text-[12px] font-medium bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 truncate max-w-[250px] border border-gray-200 dark:border-zinc-700">
                                  {replyPart}
                                </div>
                              </div>
                            );
                        })()}

                        {/* 2. Main bubble + action icons + timestamp */}
                        <div className={cn("flex items-end gap-1.5", isMe ? "flex-row-reverse ml-auto" : "flex-row mr-auto")}>
                          {/* Vertical Container for Bubble & Timestamp */}
                          <div className={cn("flex flex-col gap-1", isMe ? "items-end ml-auto" : "items-start mr-auto")}>
                            <div className="relative">
                              <div className={cn(
                                "px-4 py-2.5 text-[13px] shadow-sm leading-relaxed",
                                isMe
                                  ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                                  : "bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl rounded-tl-sm text-gray-800 dark:text-zinc-100"
                              )}>
                                {editingMessageId === msg.id ? (
                                  <div className="flex items-center gap-2 min-w-[200px]">
                                    <input
                                      type="text"
                                      value={editingText}
                                      onChange={(e) => setEditingText(e.target.value)}
                                      className="h-7 w-full px-2 text-[13px] bg-white/20 dark:bg-black/20 border-none outline-none rounded-md text-inherit placeholder-white/50"
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
                                    }} className="p-1 hover:bg-white/20 rounded">
                                      <Check className="h-3 w-3" />
                                    </button>
                                    <button onClick={() => setEditingMessageId(null)} className="p-1 hover:bg-white/20 rounded">
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div>{msg.content.split('|REACT:')[0].startsWith('|REPLY:') ? msg.content.split('|REACT:')[0].split('|ENDREPLY|').pop() : msg.content.split('|REACT:')[0]}</div>
                                )}
                              </div>
                              {msg.content.includes('|REACT:') && (
                                <div className={cn(
                                  "absolute -bottom-2.5 w-6 h-6 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-sm rounded-full flex items-center justify-center text-[11px] z-10",
                                  isMe ? "left-0 -translate-x-1/4" : "right-0 translate-x-1/4"
                                )}>
                                  {msg.content.split('|REACT:')[1]}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400 dark:text-zinc-500 px-1 mt-0.5">
                              {isMe && (
                                msg.is_read ? <CheckCheck className="h-3.5 w-3.5 text-blue-500" /> : <Check className="h-3 w-3" />
                              )}
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>

                          {/* Action Icons */}
                          {!editingMessageId && (
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 mb-5 shrink-0 relative menu-container">
                              {isMe && (
                                <div className="relative">
                                  <button
                                    onClick={() => setOpenMenuId(openMenuId === msg.id ? null : msg.id)}
                                    className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                                  >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                  </button>
                                  {openMenuId === msg.id && (
                                    <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-zinc-850 border border-gray-200 dark:border-zinc-700/80 rounded-xl shadow-lg overflow-hidden min-w-[110px] py-1">
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
                                        className="flex items-center gap-2 w-full px-3 py-1.5 text-[11px] font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-200"
                                      >
                                        <Pencil className="h-3 w-3" /> Edit
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleDeleteMessage(msg.id);
                                          setOpenMenuId(null);
                                        }}
                                        className="flex items-center gap-2 w-full px-3 py-1.5 text-[11px] font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                                      >
                                        <Trash2 className="h-3 w-3" /> Unsend
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                              <button 
                                onClick={() => setReplyingTo(msg)} 
                                className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                              >
                                <Reply className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="flex flex-col bg-white dark:bg-zinc-900 border-t border-gray-150 dark:border-zinc-800/80">
                {replyingTo && (
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-zinc-850 border-b border-gray-150 dark:border-zinc-800">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                        Replying to {replyingTo.sender_email === activeRecipient?.email ? activeRecipient?.name : 'yourself'}
                      </span>
                      <span className="text-[12px] font-medium text-gray-600 dark:text-zinc-300 line-clamp-1">
                        {replyingTo.content.split('|REACT:')[0].split('|ENDREPLY|').pop()}
                      </span>
                    </div>
                    <button type="button" onClick={() => setReplyingTo(null)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
                      <X className="h-3.5 w-3.5 text-gray-500 dark:text-zinc-400" />
                    </button>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="p-4 flex gap-3 relative items-end">
                  <div className="relative flex-1 bg-gray-100 dark:bg-zinc-800 border border-transparent focus-within:border-gray-200 dark:focus-within:border-zinc-700 focus-within:bg-white dark:focus-within:bg-zinc-900 rounded-2xl transition-all shadow-sm">
                    <textarea
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      rows={1}
                      className="w-full bg-transparent border-none outline-none resize-none px-4 py-3 text-[13px] text-gray-800 dark:text-zinc-200 min-h-[44px] max-h-[120px]"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading || !newMessage.trim()}
                    className="h-11 w-11 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-md shadow-blue-600/20 transition-colors shrink-0"
                  >
                    <Send className="h-4 w-4 ml-0.5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-zinc-500 gap-4 p-12 text-center bg-gray-50/50 dark:bg-zinc-950">
              <div className="w-20 h-20 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center border border-gray-200 dark:border-zinc-800 shadow-sm">
                <MessageSquare className="h-8 w-8 text-gray-300 dark:text-zinc-600 stroke-[1.5]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100 tracking-tight">Select a Contact</h3>
                <p className="max-w-[280px] text-[13px] font-medium text-gray-500 dark:text-zinc-400">Choose a partner organization or student from the left sidebar to start communicating.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
