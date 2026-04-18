import { MessageSquare, Search, Send, Settings, X, Check, XCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export const StudentMessagesTab = ({ selectedOwner = null }) => {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("messages"); // "messages" or "requests"
  const messagesEndRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user")) || {};

  // Helper function to create conversation ID (same as backend)
  const createConversationId = (userId1, userId2) => {
    if (!userId1 || !userId2) return null;
    const ids = [userId1.toString(), userId2.toString()].sort();
    return `${ids[0]}_${ids[1]}`;
  };

  const getConversationPartner = (conversation) => {
    if (!conversation || !currentUser?._id) return null;

    const initiator = conversation.initiatorId;
    const recipient = conversation.recipientId;

    const initiatorId = initiator?._id || initiator;
    const recipientId = recipient?._id || recipient;

    if (!initiatorId || !recipientId) return null;

    return String(initiatorId) === String(currentUser._id) ? recipient : initiator;
  };

  const normalizeConversation = (conversation) => {
    if (!conversation) return conversation;
    if (conversation.partnerInfo) return conversation;
    return {
      ...conversation,
      partnerInfo: getConversationPartner(conversation)
    };
  };

  // Scroll to bottom when messages load
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/messages/user/${currentUser._id}`
      );
      if (response.ok) {
        const data = await response.json();
        setConversations(data.map(normalizeConversation));
      }
    } catch (err) {
      console.error("Error loading conversations:", err);
    }
  }, [currentUser._id]);

  // Load pending requests
  const loadPendingRequests = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/messages/requests/${currentUser._id}`
      );
      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data.map(normalizeConversation));
      }
    } catch (err) {
      console.error("Error loading pending requests:", err);
    }
  }, [currentUser._id]);

  const loadMessages = useCallback(async (conversationId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5001/api/messages/conversation/${conversationId}?userId=${currentUser._id}`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser._id]);

  const markConversationAsRead = useCallback(async (conversationId) => {
    try {
      await fetch(
        `http://localhost:5001/api/messages/conversation/${conversationId}/read`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUser._id })
        }
      );
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  }, [currentUser._id]);

  // Accept a conversation request
  const handleAcceptRequest = async (conversationId) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/messages/accept/${conversationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUser._id })
        }
      );

      if (response.ok) {
        const acceptedConversation = normalizeConversation(await response.json());
        setPendingRequests(prev =>
          prev.filter(req => req.conversationId !== conversationId)
        );
        setConversations(prev => [acceptedConversation, ...prev]);
        setSelectedConversation(acceptedConversation);
        setActiveTab("messages");
        loadPendingRequests();
      }
    } catch (err) {
      console.error("Error accepting request:", err);
      alert("Failed to accept request");
    }
  };

  // Reject a conversation request
  const handleRejectRequest = async (conversationId) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/messages/reject/${conversationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUser._id })
        }
      );

      if (response.ok) {
        setPendingRequests(prev =>
          prev.filter(req => req.conversationId !== conversationId)
        );
        loadPendingRequests();
      }
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert("Failed to reject request");
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations and requests on mount or when roommate is passed via state
  useEffect(() => {
    if (currentUser?._id) {
      loadConversations();
      loadPendingRequests();
    }

    // If selectedOwner prop is passed (from property detail), initiate conversation with owner
    if (selectedOwner?.id && currentUser?._id) {
      initiateConversation(selectedOwner.id, selectedOwner.name);
    }
    // If coming from roommate detail, initiate conversation
    else if (location.state?.roommateName && location.state?.roommateId) {
      initiateConversation(location.state.roommateId, location.state.roommateName);
    }
  }, [currentUser?._id, location.state, selectedOwner, loadConversations, loadPendingRequests]);

  // Initiate a new conversation (handshake)
  const initiateConversation = async (recipientId, recipientName) => {
    try {
      const response = await fetch("http://localhost:5001/api/messages/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentUser._id,
          recipientId: recipientId,
          initialMessage: `Hey ${recipientName}! I'd like to connect.`
        })
      });

      if (response.ok) {
        const conversation = await response.json();
        setSelectedConversation(normalizeConversation(conversation));
        loadConversations();
        loadPendingRequests();
      }
    } catch (err) {
      console.error("Error initiating conversation:", err);
    }
  };

  // Load messages for selected conversation
  useEffect(() => {
    if (selectedConversation?.conversationId) {
      loadMessages(selectedConversation.conversationId);
      markConversationAsRead(selectedConversation.conversationId);
    }
  }, [selectedConversation?.conversationId, loadMessages, markConversationAsRead]);

  // Poll for new messages and conversation updates automatically
  useEffect(() => {
    if (!currentUser?._id) return;

    const interval = setInterval(() => {
      if (selectedConversation?.conversationId && selectedConversation.status === "accepted") {
        loadMessages(selectedConversation.conversationId);
      }
      loadConversations();
      loadPendingRequests();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser?._id, selectedConversation?.conversationId, selectedConversation?.status, loadConversations, loadMessages, loadPendingRequests]);

  const handleSendMessage = async () => {
    if (!newMessageText.trim() || !selectedConversation) return;

    const partner = selectedConversation.partnerInfo || getConversationPartner(selectedConversation);
    const recipientId = partner?._id || partner;
    if (!recipientId) {
      console.error("No recipient found for selected conversation", selectedConversation);
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentUser._id,
          recipientId,
          text: newMessageText
        })
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages([...messages, newMessage]);
        setNewMessageText("");
        loadConversations();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    // Add null/undefined checks for safety
    if (!conv || !conv.initiatorId || !conv.recipientId || !currentUser._id) {
      console.warn("Missing conversation data:", { conv, currentUserId: currentUser._id });
      return false;
    }
    
    // If no search query, show all conversations
    if (!searchQuery.trim()) {
      return true;
    }
    
    const initiatorId = conv.initiatorId?._id || conv.initiatorId;
    const partnerName = String(initiatorId) === String(currentUser._id)
      ? conv.recipientId?.fullname
      : conv.initiatorId?.fullname;

    return partnerName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedPartner = selectedConversation
    ? selectedConversation.partnerInfo || getConversationPartner(selectedConversation)
    : null;

  // Log conversations for debugging
  useEffect(() => {
    console.log("Conversations loaded:", {
      total: conversations.length,
      conversations: conversations.map(c => ({
        id: c.conversationId,
        initiator: c.initiatorId?.fullname,
        recipient: c.recipientId?.fullname,
        status: c.status
      }))
    });
  }, [conversations]);

  return (
    <div className="h-screen flex flex-row bg-[#0c1219]">
      {/* Left Sidebar - Conversations List */}
      <div
        className={`${
          selectedConversation ? "hidden md:flex" : "flex"
        } flex-col w-full md:w-80 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-white/10`}
      >
        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex-1 py-3 font-medium text-sm transition ${
              activeTab === "messages"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Messages
            {filteredConversations.length > 0 && (
              <span className="ml-2 text-xs">({filteredConversations.length})</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 py-3 font-medium text-sm transition ${
              activeTab === "requests"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Requests
            {pendingRequests.length > 0 && (
              <span className="ml-2 text-xs bg-red-500 text-white px-2 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
              placeholder="Search..."
            />
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === "messages" ? (
            // Messages Tab
            filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-4 text-center">
                <MessageSquare size={40} className="mb-3 opacity-30" />
                <p className="text-sm font-medium">No accepted conversations</p>
                <p className="text-xs mt-2">
                  {conversations.length > 0 
                    ? `You have ${conversations.length} conversation(s) but they may be pending. Check the Requests tab!`
                    : "Send a message request to start messaging"}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv, idx) => {
                // Add null/undefined checks
                if (!conv?.initiatorId || !conv?.recipientId) {
                  console.warn(`Conversation ${idx} missing initiator or recipient`, conv);
                  return null;
                }
                
                const initiatorId = conv.initiatorId?._id || conv.initiatorId;
                const isInitiator = String(initiatorId) === String(currentUser._id);
                const partnerInfo = isInitiator ? conv.recipientId : conv.initiatorId;
                const unreadCount = isInitiator 
                  ? conv.initiatorUnreadCount 
                  : conv.recipientUnreadCount;
                
                console.log(`Conversation ${idx}:`, {
                  isInitiator,
                  partnerName: partnerInfo?.fullname,
                  lastMessage: conv.lastMessage,
                  status: conv.status
                });
                
                return (
                  <button
                    key={conv.conversationId}
                    onClick={() => setSelectedConversation(normalizeConversation(conv))}
                    className={`w-full text-left px-4 py-4 border-b border-slate-800 transition ${
                      selectedConversation?.conversationId === conv.conversationId
                        ? "bg-primary/10 border-l-2 border-l-primary"
                        : "hover:bg-slate-800/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0 text-lg">
                        {partnerInfo?.fullname?.charAt(0) || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-white text-sm truncate">
                            {partnerInfo?.fullname || "Unknown User"}
                          </p>
                          {conv.status === "pending" && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate">
                          {conv.lastMessage || "No messages yet"}
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <div className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full shrink-0">
                          {unreadCount}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )
          ) : (
            // Requests Tab
            pendingRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-4 text-center">
                <MessageSquare size={40} className="mb-3 opacity-30" />
                <p className="text-sm">No pending requests</p>
              </div>
            ) : (
              pendingRequests.map((request) => {
                const initiator = request.initiatorId;
                return (
                  <div
                    key={request.conversationId}
                    className="px-4 py-4 border-b border-slate-800 hover:bg-slate-800/30 transition"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0 text-sm">
                        {initiator?.fullname?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">
                          {initiator?.fullname || "Unknown"}
                        </p>
                        <p className="text-xs text-slate-500">
                          wants to chat
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request.conversationId)}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-2 rounded-lg text-xs font-bold transition"
                      >
                        <Check size={14} /> Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.conversationId)}
                        className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-xs font-bold transition"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>
      </div>

      {/* Right Panel - Message Thread */}
      <div
        className={`${
          !selectedConversation ? "hidden md:flex" : "flex"
        } flex-1 flex-col bg-[#0c1219]`}
      >
        {selectedConversation ? (
          <>
            {/* Status Banner */}
            {selectedConversation.status === "pending" && (
              <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-3 text-sm text-yellow-400">
                ⏳ Waiting for {selectedPartner?.fullname || "them"} to accept your message request
              </div>
            )}

            {selectedConversation.status === "rejected" && (
              <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-3 text-sm text-red-400">
                ✗ This message request was rejected
              </div>
            )}

            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {selectedPartner?.fullname?.charAt(0) || "?"}
                </div>
                <div>
                  <h4 className="font-bold text-white">
                    {selectedPartner?.fullname || "Unknown"}
                  </h4>
                  <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">
                    Online
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                  <Settings size={18} />
                </button>
              </div>
            </div>

            {/* Messages or Status */}
            {selectedConversation?.status !== "accepted" ? (
              <div className="flex-1 flex items-center justify-center text-center p-6">
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <MessageSquare size={32} className="text-yellow-500" />
                  </div>
                  <p className="text-slate-400 font-medium mb-2">
                    {selectedConversation?.status === "pending"
                      ? "Waiting for response..."
                      : "Request rejected"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {selectedConversation?.status === "pending"
                      ? `${selectedPartner?.fullname || "This user"} hasn't accepted your message request yet`
                      : `${selectedPartner?.fullname || "This user"} rejected your message request`}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-500">
                      <p>Conversation started!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      if (!msg || !msg.senderId || !currentUser._id) return null;
                      const isSent = msg.senderId._id === currentUser._id;

                      return (
                        <div
                          key={msg._id}
                          className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] md:max-w-[70%] p-3 rounded-2xl text-sm ${
                              isSent
                                ? "bg-primary text-white rounded-tr-none"
                                : "bg-slate-800 text-slate-200 rounded-tl-none"
                            }`}
                          >
                            <p className="break-words">{msg.text}</p>
                            <p
                              className={`text-[10px] mt-1 ${
                                isSent ? "text-white/60" : "text-slate-500"
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10 bg-slate-900/30">
                  <div className="flex gap-2 md:gap-3">
                    <input
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none min-w-0"
                      placeholder={`Message ${selectedPartner?.fullname || "them"}...`}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessageText.trim()}
                      className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 md:px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 shrink-0 flex items-center gap-2"
                    >
                      <Send size={18} />
                      <span className="hidden md:inline">Send</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p className="font-medium">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};
