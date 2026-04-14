import React, { useState, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CompleteProfileModal from "./CompleteProfileModal";
const Header = ({ activeTab, setActiveTab, onLogout, onEditProfile, showEditProfile = false, showListProperty = true }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileCheckLoading, setProfileCheckLoading] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { id: "apartments", label: "Apartments" },
    { id: "dashboard", label: "Dashboard" },
  ];

  const handleTabClick = useCallback((id) => {
    setActiveTab(id);
    setIsMenuOpen(false);

    if (id === "dashboard") {
      navigate("/owner-dashboard");
    }
  }, [setActiveTab, navigate]);

  const isProfileComplete = (profile) => {
    if (!profile || Object.keys(profile).length === 0) return false;
    const hasBudget = profile.livingPreferences?.budget > 0;
    const hasSleep = profile.lifestyle?.sleep !== "" && profile.lifestyle?.sleep != null;
    const hasSocial = profile.lifestyle?.social !== "" && profile.lifestyle?.social != null;
    return hasBudget && hasSleep && hasSocial;
  };

  const handleSwitchRole = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const role = localStorage.getItem("role");

    if (role === "student") {
      localStorage.setItem("role", "owner");
      navigate("/owner-dashboard", { state: { switchRole: true } });
    } else {
      try {
        setProfileCheckLoading(true);
        const stored = JSON.parse(localStorage.getItem("user"));
        if (!stored?._id) {
          localStorage.setItem("role", "student");
          navigate("/student-dashboard", { state: { switchRole: true } });
          return;
        }
        const res = await fetch(`http://localhost:5001/api/profile/${stored._id}`);
        const profile = res.ok ? await res.json() : {};
        setProfileCheckLoading(false);

        if (isProfileComplete(profile)) {
          localStorage.setItem("role", "student");
          navigate("/student-dashboard", { state: { switchRole: true } });
        } else {
          setShowProfileModal(true);
        }
      } catch (err) {
        console.error("Profile check failed:", err);
        setProfileCheckLoading(false);
        localStorage.setItem("role", "student");
        navigate("/student-dashboard", { state: { switchRole: true } });
      }
    }
  }, [navigate]);

  const handleCompleteProfile = useCallback(() => {
    setShowProfileModal(false);
    localStorage.setItem("role", "student");
    navigate("/onboarding");
  }, [navigate]);

  const handleSkipProfile = useCallback(() => {
    setShowProfileModal(false);
    localStorage.setItem("role", "student");
    navigate("/student-dashboard", { state: { switchRole: true } });
  }, [navigate]);

  return (
    <header className="flex items-center justify-between border-b border-solid border-slate-800 px-4 md:px-6 py-3 bg-background-dark z-[10000] sticky top-0">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex items-center gap-3">
          {/* RoomSync Diamond Logo */}
          <div className="relative w-8 h-8 md:w-9 md:h-9">
            <div className="absolute inset-0 border-[3px] border-white/20 rounded-md rotate-45 -translate-x-1 -translate-y-1"></div>
            <div className="absolute inset-0 border-[3px] border-accent-teal rounded-md rotate-45 translate-x-1 translate-y-1"></div>
          </div>

          <h2 className="text-white text-lg md:text-xl font-black tracking-tight">
            Room<span className="text-accent-teal">Sync</span>
          </h2>
        </div>
      </div>

      <div className="flex flex-1 justify-end gap-4 md:gap-8 items-center">
        <nav className="hidden md:flex items-center gap-6 lg:gap-9">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`text-sm font-medium transition-colors ${
                activeTab === item.id ? "text-primary border-b-2 border-primary" : "hover:text-primary text-slate-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          {showListProperty && (
            <button
              onClick={() => handleTabClick("post-property")}
              className="hidden sm:flex min-w-[100px] md:min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-9 md:h-10 px-3 md:px-4 bg-primary text-white text-xs md:text-sm font-bold transition-transform hover:scale-105"
            >
              List a Property
            </button>
          )}
          {showEditProfile && onEditProfile && (
            <button
              onClick={onEditProfile}
              className="hidden sm:flex min-w-[100px] md:min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-9 md:h-10 px-3 md:px-4 bg-white/10 text-white text-xs md:text-sm font-bold transition-transform hover:scale-105"
            >
              ✏️ Edit Profile
            </button>
          )}
          <button
            onClick={handleSwitchRole}
            disabled={profileCheckLoading}
            className="hidden md:block px-3 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-md hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {profileCheckLoading ? "Checking..." : "Switch Role"}
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="hidden md:block px-3 py-2 bg-red-600/20 text-red-400 rounded-xl text-sm font-bold shadow-md hover:bg-red-600/30 transition"
            >
              🚪 Logout
            </button>
          )}
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10001] md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[280px] bg-navy-dark border-l border-slate-800 z-[10002] md:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-bold">Menu</h2>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-400">
                  <X size={24} />
                </button>
              </div>
              <div className="flex flex-col p-6 gap-2 flex-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`text-left text-lg font-semibold py-3 px-4 rounded-xl transition-all ${
                      activeTab === item.id ? "text-accent-teal bg-accent-teal/10" : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <div className="mt-auto pt-6">
                  <button
                    onClick={() => handleTabClick("post-property")}
                    className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    List a Property
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CompleteProfileModal
        isOpen={showProfileModal}
        onCompleteProfile={handleCompleteProfile}
        onSkip={handleSkipProfile}
      />
    </header>
  );
};

export default Header;
