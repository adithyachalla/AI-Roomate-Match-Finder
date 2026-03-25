import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ApartmentListings from "./components/ApartmentListings";
import Header from "./components/Header";
import ListerDashboard from "./components/ListerDashboard";
import PostProperty from "./components/PostProperty";
import PropertyDetail from "./components/PropertyDetail";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  // Default to dashboard if redirected from PropertyDetail with ownerId or if switching roles, otherwise apartments
  const [activeTab, setActiveTab] = useState(
    location.state?.ownerId || location.state?.switchRole ? "dashboard" : "apartments"
  );
  const [dashboardSubTab, setDashboardSubTab] = useState("overview");
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [previousTab, setPreviousTab] = useState("apartments");
  const [selectedOwnerId, setSelectedOwnerId] = useState(null);
  const [selectedOwnerName, setSelectedOwnerName] = useState(null);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Handle redirect from PropertyDetail when messaging owner
  useEffect(() => {
    if (location.state?.ownerId && location.state?.ownerName) {
      setSelectedOwnerId(location.state.ownerId);
      setSelectedOwnerName(location.state.ownerName);
      setDashboardSubTab("messages");
      setActiveTab("dashboard");
    }
  }, [location.state]);

  const handleTabChange = (tab) => {
    if (tab === "dashboard") {
      setDashboardSubTab("overview");
    }
    setActiveTab(tab);
  };

  const navigateToDashboard = (subTab = "overview") => {
    setDashboardSubTab(subTab);
    setActiveTab("dashboard");
  };

  const viewPropertyDetail = (id) => {
    setPreviousTab(activeTab);
    setSelectedPropertyId(id);
    setActiveTab("property-detail");
  };

  const messageOwner = (ownerId, ownerName) => {
    // Store the owner details and navigate to messages
    setSelectedOwnerId(ownerId);
    setSelectedOwnerName(ownerName);
    setDashboardSubTab("messages");
    setActiveTab("dashboard");
  };

  return (
    <div className="dark h-screen flex flex-col bg-background-dark text-white">
      {/* allow vertical scrolling for page content */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={handleTabChange}
        onLogout={logout}
        showEditProfile={false}
        showListProperty={true}
      />
      
      <div className="flex-1 flex flex-col overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto"
          >
            {activeTab === "apartments" && <ApartmentListings onViewDetail={viewPropertyDetail} />}
            {activeTab === "post-property" && <PostProperty setActiveTab={setActiveTab} navigateToDashboard={navigateToDashboard} />}
            {activeTab === "dashboard" && <ListerDashboard setActiveTab={setActiveTab} initialSubTab={dashboardSubTab} onViewDetail={viewPropertyDetail} selectedOwnerId={selectedOwnerId} selectedOwnerName={selectedOwnerName} />}
            {activeTab === "property-detail" && (
              <PropertyDetail 
                propertyId={selectedPropertyId} 
                onBack={() => setActiveTab(previousTab)} 
                onMessageOwner={messageOwner}
                dashboardType="owner"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="bg-background-dark border-t border-slate-800 px-6 py-2 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest z-40">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            System Operational
          </span>
          <span className="hidden md:inline">v2.4.1 RoomSync Core</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="hover:text-primary transition-colors" type="button">Documentation</button>
          <button className="hover:text-primary transition-colors" type="button">Support</button>
        </div>
      </footer>
    </div>
  );
}
