import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Header = ({ activeTab, setActiveTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: "roommates", label: "Find Roommates" },
    { id: "apartments", label: "Apartments" },
    { id: "dashboard", label: "Dashboard" },
  ];

  const handleTabClick = (id) => {
    setActiveTab(id);
    setIsMenuOpen(false);
  };

  return (
    <header className="flex items-center justify-between border-b border-solid border-slate-800 px-4 md:px-6 py-3 bg-background-dark z-[10000] sticky top-0">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="size-8 text-primary">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_6_319)">
              <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z" fill="currentColor"></path>
            </g>
            <defs>
              <clipPath id="clip0_6_319"><rect fill="white" height="48" width="48"></rect></clipPath>
            </defs>
          </svg>
        </div>
        <h2 className="text-lg md:text-xl font-bold leading-tight tracking-tight">RoomSync</h2>
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
          <button
            onClick={() => handleTabClick("post-property")}
            className="hidden sm:flex min-w-[100px] md:min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-9 md:h-10 px-3 md:px-4 bg-primary text-white text-xs md:text-sm font-bold transition-transform hover:scale-105"
          >
            List a Property
          </button>
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 md:size-10 border-2 border-primary/20" style={{ backgroundImage: 'url("https://picsum.photos/seed/user/100/100")' }}></div>
          
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
    </header>
  );
};

export default Header;
