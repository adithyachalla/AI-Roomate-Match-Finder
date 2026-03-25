import { MessageSquare, Search, Send, Settings, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export const ListerMessagesTab = ({ selectedOwnerId, selectedOwnerName }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user")) || {};

  // Scroll to bottom when messages load
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const currentUserId = currentUser?._id;

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/messages/user/${currentUserId}`
      );
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (err) {
      console.error("Error loading conversations:", err);
    }
  }, [currentUserId]);

  // Mark conversation as read
  const markConversationAsRead = useCallback(async (conversationId) => {
    try {
      await fetch(
        `http://localhost:5001/api/messages/conversation/${conversationId}/read`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId })
        }
      );
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  }, [currentUserId]);

  // Load conversations on mount
  useEffect(() => {
    if (currentUserId) {
      loadConversations();
    }
  }, [currentUserId, loadConversations]);

  // When selectedOwnerId is provided, find or create conversation with that owner
  useEffect(() => {
    if (selectedOwnerId && selectedOwnerName) {
      // Create a new conversation object for this owner with proper structure
      setSelectedConversation({
        senderId: currentUser._id,
        recipientId: selectedOwnerId,
        conversationId: [currentUser._id, selectedOwnerId].sort().join('_'),
        lastMessage: `Chat with ${selectedOwnerName}`,
        partnerInfo: {
          _id: selectedOwnerId,
          fullname: selectedOwnerName
        }
      });
    }
  }, [selectedOwnerId, selectedOwnerName, currentUser._id]);

  // Load messages for selected conversation
  const loadMessages = useCallback(async (conversationId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5001/api/messages/conversation/${conversationId}`
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
  }, []);

  useEffect(() => {
    if (selectedConversation?.conversationId) {
      loadMessages(selectedConversation.conversationId);
      markConversationAsRead(selectedConversation.conversationId);
    }
  }, [selectedConversation?.conversationId, loadMessages, markConversationAsRead]);

  const handleSendMessage = async () => {
    if (!newMessageText.trim() || !selectedConversation) return;

    try {
      const recipientId = selectedConversation.partnerInfo?._id || selectedConversation.recipientId;
      
      const response = await fetch("http://localhost:5001/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentUser._id,
          recipientId: recipientId,
          text: newMessageText
        })
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages([...messages, newMessage]);
        setNewMessageText("");
        // Reload conversations to update last message
        loadConversations();
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.partnerInfo?.fullname
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden flex flex-col md:flex-row h-[600px] md:h-[650px]">
      {/* Conversations List */}
      <div
        className={`${
          selectedConversation ? "hidden md:flex" : "flex"
        } w-full md:w-80 border-r border-slate-800 flex-col bg-slate-900/30`}
      >
        <div className="p-4 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
              placeholder="Search messages..."
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-4 text-center">
              <MessageSquare size={40} className="mb-3 opacity-30" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.conversationId}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full text-left p-4 hover:bg-slate-800 transition-colors border-b border-slate-800/50 ${
                  selectedConversation?.conversationId === conv.conversationId
                    ? "bg-primary/10 border-r-4 border-primary"
                    : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h5 className="font-bold text-sm text-white">
                    {conv.partnerInfo?.fullname || "Unknown"}
                  </h5>
                  <span className="text-[10px] text-slate-500">
                    {new Date(conv.lastMessageTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {conv.lastMessage || "Start a conversation"}
                </p>
                {conv.unreadCount > 0 && (
                  <div className="bg-primary text-white text-[10px] font-bold inline-block mt-2 px-2 py-1 rounded-full">
                    {conv.unreadCount} new
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div
        className={`${
          !selectedConversation ? "hidden md:flex" : "flex"
        } flex-1 flex-col bg-slate-900/10`}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {selectedConversation.partnerInfo?.fullname?.charAt(0) || "?"}
                </div>
                <div>
                  <h4 className="font-bold text-white">
                    {selectedConversation.partnerInfo?.fullname || "Unknown"}
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

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <p>Start a conversation</p>
                </div>
              ) : (
                messages.map((msg) => {
                  // Safety check for msg and sender IDs
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
            <div className="p-4 border-t border-slate-800 bg-slate-900/30">
              <div className="flex gap-2 md:gap-3">
                <input
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none min-w-0"
                  placeholder={`Message ${selectedConversation.partnerInfo?.fullname || "them"}...`}
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
