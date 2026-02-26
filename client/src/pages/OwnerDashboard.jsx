import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import ApartmentListings from "./components/ApartmentListings";
import PostProperty from "./components/PostProperty";
import ListerDashboard from "./components/ListerDashboard";
import RoommateFinder from "./components/RoomateFinder";
import PropertyDetail from "./components/PropertyDetail";

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState("apartments");
  const [dashboardSubTab, setDashboardSubTab] = useState("overview");
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [previousTab, setPreviousTab] = useState("apartments");

  const navigateToDashboard = (subTab = "overview") => {
    setDashboardSubTab(subTab);
    setActiveTab("dashboard");
  };

  const viewPropertyDetail = (id) => {
    setPreviousTab(activeTab);
    setSelectedPropertyId(id);
    setActiveTab("property-detail");
  };

  const messageOwner = (ownerName) => {
    // Navigate to dashboard messages and select the owner
    setDashboardSubTab("messages");
    setActiveTab("dashboard");
    // We'll need to pass the owner name to the dashboard, 
    // but for now, this triggers the tab change.
  };

  return (
    <div className="dark h-screen flex flex-col overflow-hidden bg-background-dark text-white">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === "apartments" && <ApartmentListings onViewDetail={viewPropertyDetail} />}
            {activeTab === "post-property" && <PostProperty setActiveTab={setActiveTab} navigateToDashboard={navigateToDashboard} />}
            {activeTab === "dashboard" && <ListerDashboard setActiveTab={setActiveTab} initialSubTab={dashboardSubTab} onViewDetail={viewPropertyDetail} />}
            {activeTab === "roommates" && <RoommateFinder />}
            {activeTab === "property-detail" && (
              <PropertyDetail 
                propertyId={selectedPropertyId} 
                onBack={() => setActiveTab(previousTab)} 
                onMessageOwner={messageOwner}
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
          <a className="hover:text-primary transition-colors" href="#">Documentation</a>
          <a className="hover:text-primary transition-colors" href="#">Support</a>
        </div>
      </footer>
    </div>
  );
}
