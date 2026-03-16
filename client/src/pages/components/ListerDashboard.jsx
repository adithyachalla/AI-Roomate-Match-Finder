import React, { useState, useEffect } from "react";
import { LayoutDashboard, Building2, Users, MessageSquare, BarChart3, Plus as PlusIcon, RefreshCw, TrendingUp, Target, Trophy, Sparkles, Search, Settings, Menu, X } from "lucide-react";
import EditListing from "./EditListing";

const ListerDashboard = ({ setActiveTab, initialSubTab = "overview", onViewDetail }) => {
  const [listings, setListings] = useState([]);
  const [roommates, setRoommates] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tenantMatches, setTenantMatches] = useState([]);
  const [subTab, setSubTab] = useState(initialSubTab);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [editingListingId, setEditingListingId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchListings = () => {
    fetch("http://localhost:5001/api/apartments").then(res => res.json()).then(setListings);
  };

  const fetchMessages = () => {
    fetch("http://localhost:5001/api/messages").then(res => res.json()).then(setMessages);
  };

  useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);

  useEffect(() => {
    fetchListings();
    fetch("http://localhost:5001/api/roommates").then(res => res.json()).then(setRoommates);
    fetchMessages();
    fetch("http://localhost:5001/api/tenant-matches").then(res => res.json()).then(setTenantMatches);
  }, []);

  const handleSubTabChange = (tab) => {
    setSubTab(tab);
    setIsSidebarOpen(false);
  };

  const handleSendMessage = async () => {
    if (!newMessageText.trim() || !selectedConversation) return;

    try {
      const response = await fetch("http://localhost:5001/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: selectedConversation,
          text: newMessageText,
          sender: "Alex Johnson"
        })
      });

      if (response.ok) {
        setNewMessageText("");
        fetchMessages();
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const stats = [
    { label: "Total Views", value: "2,481", change: "+12%", color: "accent-teal", icon: TrendingUp },
    { label: "Active Inquiries", value: "42", change: "+5%", color: "primary", icon: MessageSquare },
    { label: "Sync Score Avg.", value: "94%", change: "0%", color: "accent-teal", icon: Target },
    { label: "Listing Strength", value: "Great", change: "-2%", color: "primary", icon: Trophy },
  ];

  return (
    <div className="flex min-h-screen bg-navy-dark relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 border-r border-slate-800 bg-navy-dark flex flex-col z-[70] transition-transform duration-300 lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex justify-center pt-12 pb-6 relative">
          <div className="flex items-center gap-3">
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden absolute right-4 top-4 text-slate-400">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          <button 
            onClick={() => handleSubTabChange("overview")}
            className={`flex w-full items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${subTab === "overview" ? "bg-accent-teal/10 text-accent-teal border-r-4 border-accent-teal" : "text-slate-500 hover:bg-slate-800"}`}
          >
            <LayoutDashboard size={20} /> <span>Overview</span>
          </button>
          <button 
            onClick={() => handleSubTabChange("listings")}
            className={`flex w-full items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${subTab === "listings" ? "bg-accent-teal/10 text-accent-teal border-r-4 border-accent-teal" : "text-slate-500 hover:bg-slate-800"}`}
          >
            <Building2 size={20} /> <span>My Listings</span>
          </button>
          <button 
            onClick={() => handleSubTabChange("matches")}
            className={`flex w-full items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${subTab === "matches" ? "bg-accent-teal/10 text-accent-teal border-r-4 border-accent-teal" : "text-slate-500 hover:bg-slate-800"}`}
          >
            <Users size={20} /> <span>Tenant Matches</span>
          </button>
          <button 
            onClick={() => handleSubTabChange("messages")}
            className={`flex w-full items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${subTab === "messages" ? "bg-accent-teal/10 text-accent-teal border-r-4 border-accent-teal" : "text-slate-500 hover:bg-slate-800"}`}
          >
            <MessageSquare size={20} /> <span>Messages</span>
          </button>
          <button 
            onClick={() => handleSubTabChange("analytics")}
            className={`flex w-full items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${subTab === "analytics" ? "bg-accent-teal/10 text-accent-teal border-r-4 border-accent-teal" : "text-slate-500 hover:bg-slate-800"}`}
          >
            <BarChart3 size={20} /> <span>Analytics</span>
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => {
              setActiveTab("post-property");
              setIsSidebarOpen(false);
            }}
            className="w-full bg-accent-teal hover:bg-accent-teal/90 text-navy-dark font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-accent-teal/20"
          >
            <PlusIcon size={20} /> Add New Listing
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-background-dark lg:ml-64 min-w-0">
        <header className="h-20 border-b border-slate-800 bg-background-dark/80 backdrop-blur-md sticky top-0 px-4 md:px-8 flex items-center justify-between z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-lg">
              <Menu size={24} />
            </button>
            <h2 className="text-lg md:text-xl font-bold text-white capitalize">{subTab}</h2>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="relative hidden sm:block">
              <button className="p-2 text-slate-500 hover:bg-slate-800 rounded-full transition-colors">
                <RefreshCw size={20} />
              </button>
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent-teal rounded-full ring-2 ring-background-dark"></span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 border-l border-slate-800 pl-4 md:pl-6">
              <div className="text-right hidden xs:block">
                <p className="text-sm font-bold text-white">Alex Johnson</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Premium Lister</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/20 border-2 border-accent-teal flex items-center justify-center overflow-hidden">
                <img alt="User" className="w-full h-full object-cover" src="https://picsum.photos/seed/lister/100/100" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-8">
          {subTab === "overview" && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-10 h-10 bg-${stat.color}/10 rounded-xl flex items-center justify-center`}>
                        <stat.icon size={20} className={`text-${stat.color}`} />
                      </div>
                      <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-green-500' : stat.change === '0%' ? 'text-slate-400' : 'text-red-500'}`}>
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                    <h3 className="text-2xl font-extrabold mt-1 text-white">{stat.value}</h3>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Listings Table */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Recent Listings</h3>
                    <button onClick={() => handleSubTabChange("listings")} className="text-accent-teal text-sm font-bold hover:underline">View All</button>
                  </div>
                  <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden overflow-x-auto">
                    <table className="w-full text-left min-w-[500px]">
                      <thead className="bg-slate-800/50 border-b border-slate-800">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Property</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Matches</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {listings.slice(0, 3).map(listing => (
                          <tr key={listing._id} className="cursor-pointer hover:bg-slate-800/30 transition-colors" onClick={() => onViewDetail(listing._id)}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                                  <img alt="Property" className="w-full h-full object-cover" src={listing.images?.[0]} />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-sm text-white truncate">{listing.title}</p>
                                  <p className="text-xs text-slate-500 truncate">{listing.address}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${listing.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                {listing.status || 'Active'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex -space-x-2">
                                {[1, 2].map(n => (
                                  <div key={n} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-300 overflow-hidden">
                                    <img src={`https://images.unsplash.com/photo-${n === 1 ? '1500648767791-00dcc994a43e' : '1438761681033-6461ffad8d80'}?auto=format&fit=crop&w=50&q=80`} alt="User" />
                                  </div>
                                ))}
                                <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-accent-teal flex items-center justify-center text-[8px] font-bold text-navy-dark">+{listing.matches || 0}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Refresh logic or similar
                                }}
                                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-accent-teal transition-colors"
                              >
                                <RefreshCw size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top AI Matches */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white">Top AI Matches</h3>
                  <div className="bg-gradient-to-br from-primary to-navy-dark p-6 rounded-2xl border border-primary/30 relative overflow-hidden">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent-teal/10 rounded-full blur-3xl"></div>
                    <div className="relative space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                          <span className="text-[10px] text-accent-teal font-bold uppercase tracking-widest">High Compatibility</span>
                        </div>
                        <Sparkles size={20} className="text-accent-teal" />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-2 border-accent-teal p-1">
                          <img alt="Match" className="w-full h-full rounded-full bg-slate-800 object-cover" src={roommates[0]?.avatar_url || "https://picsum.photos/seed/sarah/100/100"} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{roommates[0]?.name || "Sarah Miller"}</h4>
                          <div className="flex items-center gap-1 text-accent-teal">
                            <Sparkles size={14} />
                            <span className="text-sm font-extrabold">98% Sync Score</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        Sarah matches your preferences for a quiet, study-focused environment and shared utility goals.
                      </p>
                      <button className="w-full bg-accent-teal text-navy-dark font-bold py-3 rounded-xl hover:bg-accent-teal/90 transition-all">
                        Connect Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {subTab === "listings" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-2xl font-bold text-white">My Listings</h3>
                <button 
                  onClick={() => setActiveTab("post-property")}
                  className="bg-primary text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  <PlusIcon size={18} /> New Listing
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map(listing => (
                  <div
                    key={listing._id}
                    className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden group cursor-pointer"
                    onClick={() => onViewDetail(listing._id)}
                  >
                    <div className="h-48 relative overflow-hidden">
                      <img src={listing.images?.[0]} alt={listing.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute top-3 right-3 bg-navy-dark/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white uppercase">
                        {listing.status}
                      </div>
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold text-lg text-white mb-1 truncate">{listing.title}</h4>
                      <p className="text-sm text-slate-500 mb-4 truncate">{listing.address}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-bold">${listing.price}/mo</span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingListingId(listing._id);
                              setSubTab("edit-listing");
                            }}
                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-colors"
                          >
                            <Settings size={16} />
                          </button>
                          <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><BarChart3 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {subTab === "matches" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">Tenant Matches</h3>
              <div className="grid gap-4">
                {tenantMatches.map(match => (
                  <div key={match.id} className="bg-slate-900/50 border border-slate-800 p-4 md:p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                    <div className="w-16 h-16 rounded-full border-2 border-accent-teal p-1 shrink-0">
                      <img src={match.avatar} alt={match.name} className="w-full h-full rounded-full object-cover" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <h4 className="font-bold text-lg text-white">{match.name}</h4>
                        <span className="px-2 py-0.5 bg-accent-teal/10 text-accent-teal text-[10px] font-bold rounded uppercase w-fit mx-auto sm:mx-0">
                          {match.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">Interested in <span className="text-white font-medium">{match.property}</span></p>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="flex items-center justify-center sm:justify-end gap-1 text-accent-teal font-bold text-xl mb-1">
                        <Sparkles size={18} /> {match.score}%
                      </div>
                      <button className="text-xs font-bold text-primary hover:underline">View Profile</button>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedConversation(match.name);
                        handleSubTabChange("messages");
                      }}
                      className="w-full sm:w-auto bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
                    >
                      Message
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {subTab === "messages" && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden flex flex-col md:flex-row h-[600px] md:h-[650px]">
              {/* Conversations List */}
              <div className={`
                ${selectedConversation ? 'hidden md:flex' : 'flex'}
                w-full md:w-80 border-r border-slate-800 flex-col bg-slate-900/30
              `}>
                <div className="p-4 border-b border-slate-800">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                    <input className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" placeholder="Search messages..." />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {Array.from(new Set([
                    ...messages.map(m => m.sender === "Alex Johnson" ? m.recipient : m.sender),
                    ...(selectedConversation ? [selectedConversation] : [])
                  ])).map(person => {
                    const lastMsg = [...messages].reverse().find(m => m.sender === person || m.recipient === person);
                    return (
                      <div 
                        key={person} 
                        onClick={() => setSelectedConversation(person)}
                        className={`p-4 hover:bg-slate-800 cursor-pointer transition-colors border-b border-slate-800/50 ${selectedConversation === person ? 'bg-primary/10 border-r-4 border-primary' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h5 className="font-bold text-sm text-white">{person}</h5>
                          <span className="text-[10px] text-slate-500">{lastMsg?.time || "New"}</span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">{lastMsg?.text || "Start a conversation"}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chat Window */}
              <div className={`
                ${!selectedConversation ? 'hidden md:flex' : 'flex'}
                flex-1 flex-col bg-slate-900/10
              `}>
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/30">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setSelectedConversation(null)} className="md:hidden p-2 text-slate-400">
                          <X size={20} />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {selectedConversation.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{selectedConversation}</h4>
                          <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Online</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Settings size={18} /></button>
                      </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
                      {messages
                        .filter(m => m.sender === selectedConversation || m.recipient === selectedConversation)
                        .map(msg => (
                          <div key={msg.id} className={`flex ${msg.sender === "Alex Johnson" ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] md:max-w-[70%] p-3 rounded-2xl text-sm ${
                              msg.sender === "Alex Johnson" 
                                ? 'bg-primary text-white rounded-tr-none' 
                                : 'bg-slate-800 text-slate-200 rounded-tl-none'
                            }`}>
                              <p>{msg.text}</p>
                              <p className={`text-[10px] mt-1 ${msg.sender === "Alex Johnson" ? 'text-white/60' : 'text-slate-500'}`}>
                                {msg.time}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-slate-800 bg-slate-900/30">
                      <div className="flex gap-2 md:gap-3">
                        <input 
                          value={newMessageText}
                          onChange={(e) => setNewMessageText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none min-w-0" 
                          placeholder={`Message ${selectedConversation}...`} 
                        />
                        <button 
                          onClick={handleSendMessage}
                          className="bg-primary hover:bg-primary/90 text-white px-4 md:px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 shrink-0"
                        >
                          Send
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
          )}

          {subTab === "analytics" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-2xl font-bold text-white">Performance Analytics</h3>
                <div className="flex gap-2">
                  <button className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 rounded-lg text-sm font-bold">Last 30 Days</button>
                  <button className="flex-1 sm:flex-none px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold">Export Report</button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900/50 p-6 md:p-8 rounded-2xl border border-slate-800">
                  <h4 className="font-bold text-lg mb-6">Views Over Time</h4>
                  <div className="h-64 flex items-end gap-1 md:gap-2">
                    {[40, 65, 45, 90, 75, 55, 85, 60, 95, 80, 70, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary/20 rounded-t-lg relative group">
                        <div className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all" style={{ height: `${h}%` }}></div>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {h * 10}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <span>Jan</span>
                    <span>Jun</span>
                    <span>Dec</span>
                  </div>
                </div>

                <div className="bg-slate-900/50 p-6 md:p-8 rounded-2xl border border-slate-800">
                  <h4 className="font-bold text-lg mb-6">Lead Sources</h4>
                  <div className="space-y-6">
                    {[
                      { label: "Direct Search", value: 45, color: "bg-primary" },
                      { label: "Social Media", value: 30, color: "bg-accent-teal" },
                      { label: "University Portals", value: 15, color: "bg-amber-500" },
                      { label: "Referrals", value: 10, color: "bg-slate-500" }
                    ].map((source, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                          <span>{source.label}</span>
                          <span>{source.value}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${source.color}`} style={{ width: `${source.value}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {subTab === "edit-listing" && editingListingId && (
            <EditListing 
              listingId={editingListingId} 
              onBack={() => handleSubTabChange("listings")} 
              onSave={() => {
                fetchListings();
                handleSubTabChange("listings");
              }} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default ListerDashboard;
