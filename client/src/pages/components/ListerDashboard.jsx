import { BarChart3, Building2, LayoutDashboard, Menu, MessageSquare, Plus as PlusIcon, RefreshCw, Settings, TrendingUp, Trophy, X } from "lucide-react";
import { useEffect, useState } from "react";
import EditListing from "./EditListing";
import { ListerMessagesTab } from "./ListerMessagesTab";

const ListerDashboard = ({ setActiveTab, initialSubTab = "overview", onViewDetail, selectedOwnerId, selectedOwnerName }) => {
  const [listings, setListings] = useState([]);
  const [subTab, setSubTab] = useState(initialSubTab);
  const [editingListingId, setEditingListingId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [analyticsOverview, setAnalyticsOverview] = useState(null);
  const [analyticsDetailed, setAnalyticsDetailed] = useState(null);

  const [ownerId, setOwnerId] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [profile, setProfile] = useState(null);

  const fetchListings = () => {
    fetch("http://localhost:5001/api/apartments").then(res => res.json()).then(setListings);
  };

  const fetchAnalyticsOverview = (ownerId) => {
    fetch(`http://localhost:5001/api/analytics/overview/${ownerId}`)
      .then(res => res.json())
      .then(setAnalyticsOverview)
      .catch(err => console.error("Failed to fetch analytics overview:", err));
  };

  const fetchAnalyticsDetailed = (ownerId) => {
    fetch(`http://localhost:5001/api/analytics/detailed/${ownerId}`)
      .then(res => res.json())
      .then(setAnalyticsDetailed)
      .catch(err => console.error("Failed to fetch detailed analytics:", err));
  };

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    console.log("OwnerId useEffect triggered - ownerId:", ownerId);
    if (ownerId) {
      console.log("Calling fetchAnalyticsOverview and fetchAnalyticsDetailed");
      fetchAnalyticsOverview(ownerId);
      fetchAnalyticsDetailed(ownerId);
    }
  }, [ownerId]);

  useEffect(() => {
    const loadOwner = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

        if (!storedUser?._id) return;

        const res = await fetch(`http://localhost:5001/api/profile/${storedUser._id}`);
        const profile = await res.json();
        setProfile(profile);

        setOwnerId(profile.userId || storedUser._id);
        setOwnerName(profile.fullname || storedUser.fullname || "");
      } catch (err) {
        console.error("Failed to load owner profile:", err);
      }
    };

    loadOwner();
  }, []);
  const myListings = Array.isArray(listings)
    ? listings.filter((listing) => String(listing.ownerId) === String(ownerId))
    : [];

  const handleSubTabChange = (tab) => {
    setSubTab(tab);
    setIsSidebarOpen(false);
  };

  const stats = analyticsOverview ? [
    { label: "Total Views", value: analyticsOverview.totalViews.toLocaleString(), change: analyticsOverview.changeViews, color: "accent-teal", icon: TrendingUp },
    { label: "Active Inquiries", value: analyticsOverview.activeInquiries.toString(), change: analyticsOverview.changeInquiries, color: "primary", icon: MessageSquare },
    { label: "Listing Strength", value: analyticsOverview.listingStrength, change: analyticsOverview.changeStrength, color: "primary", icon: Trophy },
  ] : [
    { label: "Total Views", value: "Loading...", change: "", color: "accent-teal", icon: TrendingUp },
    { label: "Active Inquiries", value: "Loading...", change: "", color: "primary", icon: MessageSquare },
    { label: "Listing Strength", value: "Loading...", change: "", color: "primary", icon: Trophy },
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
          <div className="flex items-center gap-3">
            <img
              src={profile?.profilePic || "/default-avatar.png"}
              alt="profile"
              className="w-10 h-10 rounded-full border border-slate-600 object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-white truncate">
                {profile?.fullname || "User"}
              </p>
              <p className="text-xs text-slate-400 capitalize">
                {profile?.role || "owner"}
              </p>
            </div>
          </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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

              {/* Recent Listings */}
              <div className="space-y-6">
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
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {listings.slice(0, 5).map(listing => (
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
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
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
                {myListings.map((listing) => (
                  <div
                    key={listing._id}
                    className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden group cursor-pointer"
                    onClick={() => onViewDetail(listing._id)}
                  >
                    <div className="h-48 relative overflow-hidden">
                      <img
                        src={listing.images?.[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute top-3 right-3 bg-navy-dark/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white uppercase">
                        {listing.status}
                      </div>
                    </div>

                    <div className="p-5">
                      <h4 className="font-bold text-lg text-white mb-1 truncate">
                        {listing.title}
                      </h4>
                      <p className="text-sm text-slate-500 mb-4 truncate">
                        {listing.address}
                      </p>

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
                          <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
                            <BarChart3 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {subTab === "messages" && (
            <ListerMessagesTab selectedOwnerId={selectedOwnerId} selectedOwnerName={selectedOwnerName} />
          )}

          {subTab === "analytics" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-2xl font-bold text-white">Listing Analytics</h3>
              </div>

              {/* Analytics Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-accent-teal/10 rounded-xl flex items-center justify-center">
                      <Building2 size={20} className="text-accent-teal" />
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Total Listings</p>
                  <h3 className="text-2xl font-extrabold mt-1 text-white">{analyticsDetailed?.totalListings || "Loading..."}</h3>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                      <Building2 size={20} className="text-green-500" />
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Active Listings</p>
                  <h3 className="text-2xl font-extrabold mt-1 text-white">{analyticsDetailed?.activeListings || "Loading..."}</h3>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-accent-teal/10 rounded-xl flex items-center justify-center">
                      <TrendingUp size={20} className="text-accent-teal" />
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Total Views</p>
                  <h3 className="text-2xl font-extrabold mt-1 text-white">{analyticsDetailed?.totalViews?.toLocaleString() || "Loading..."}</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900/50 p-6 md:p-8 rounded-2xl border border-slate-800">
                  <h4 className="font-bold text-lg mb-6">Views Over Time</h4>
                  <div className="h-64 flex items-end gap-1 md:gap-2">
                    {analyticsDetailed?.viewsOverTime && analyticsDetailed.viewsOverTime.length > 0 ? (() => {
                      const maxViews = Math.max(...analyticsDetailed.viewsOverTime.map(d => d.views), 1);
                      return analyticsDetailed.viewsOverTime.map((data, i) => {
                        const heightPercent = data.views > 0 ? (data.views / maxViews) * 100 : 2;
                        return (
                          <div key={i} className="flex-1 bg-slate-700 rounded-t-lg relative group min-h-[4px]">
                            <div 
                              className={`absolute bottom-0 w-full rounded-t-lg transition-all ${data.views > 0 ? 'bg-blue-500' : 'bg-slate-500'}`} 
                              style={{ height: `${Math.max(heightPercent, 4)}%` }}
                            ></div>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              {data.views}
                            </div>
                          </div>
                        );
                      });
                    })() : (
                      Array.from({ length: 12 }, (_, i) => (
                        <div key={i} className="flex-1 bg-slate-600 rounded-t-lg animate-pulse min-h-[4px]"></div>
                      ))
                    )}
                  </div>
                  <div className="flex justify-between mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    {analyticsDetailed?.viewsOverTime && analyticsDetailed.viewsOverTime.length > 0 ? analyticsDetailed.viewsOverTime.map((data, i) => (
                      <span key={i}>{data.month}</span>
                    )) : <span>Loading...</span>}
                  </div>
                </div>

                <div className="bg-slate-900/50 p-6 md:p-8 rounded-2xl border border-slate-800">
                  <h4 className="font-bold text-lg mb-6">Lead Sources</h4>
                  <div className="space-y-6">
                    {analyticsDetailed?.leadSources ? analyticsDetailed.leadSources.map((source, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                          <span>{source.label}</span>
                          <span>{source.value}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-accent-teal' : i === 2 ? 'bg-amber-500' : 'bg-slate-500'}`} style={{ width: `${source.value}%` }}></div>
                        </div>
                      </div>
                    )) : (
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
                        <div className="h-2 bg-slate-800 rounded-full"></div>
                      </div>
                    )}
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
