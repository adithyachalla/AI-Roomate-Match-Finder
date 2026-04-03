import { ChevronDown, Search } from "lucide-react";
import { useEffect, useState } from "react";
import RoommateCard from "./RoommateCard";

const RoommateListings = ({ onViewDetail }) => {
  const [allRoommates, setAllRoommates] = useState([]);
  const [filteredRoommates, setFilteredRoommates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [budgetFilter, setBudgetFilter] = useState(null);
  const [cleanlinessFilter, setCleanlinessFilter] = useState(null);
  const [sleepFilter, setSleepFilter] = useState(null);
  const [socialFilter, setSocialFilter] = useState(null);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState([]);
  const [showBudgetMenu, setShowBudgetMenu] = useState(false);
  const [showCleanlinessMenu, setShowCleanlinessMenu] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [showSocialMenu, setShowSocialMenu] = useState(false);
  const [showNeighborhoodMenu, setShowNeighborhoodMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState("Best Match");
  const [allNeighborhoods, setAllNeighborhoods] = useState([]);

  // Fetch all roommates
  useEffect(() => {
    const fetchRoommates = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem("user"));
        const currentUserId = stored?._id;

        const response = await fetch("http://localhost:5001/api/profile");
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Filter out current user (userId may be ObjectId in JSON; compare as strings)
        const filteredData = data.filter(
          (profile) => String(profile.userId) !== String(currentUserId ?? "")
        );
        
        setAllRoommates(filteredData);
        setFilteredRoommates(filteredData);
        
        // Extract all unique neighborhoods
        const neighborhoods = new Set();
        filteredData.forEach(profile => {
          profile.livingPreferences?.neighborhoods?.forEach(n => {
            neighborhoods.add(n);
          });
        });
        setAllNeighborhoods(Array.from(neighborhoods));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching roommates:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRoommates();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...allRoommates];

    // Search by name or username
    if (searchQuery) {
      try {
        const regex = new RegExp(searchQuery, "i");
        result = result.filter(profile => 
          regex.test(profile.fullname) || 
          regex.test(profile.username) || 
          regex.test(profile.bio || "")
        );
      } catch (e) {
        // Fallback to simple search
        result = result.filter(profile => 
          profile.fullname.toLowerCase().includes(searchQuery.toLowerCase()) || 
          profile.username.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    }

    // Budget Filter
    if (budgetFilter) {
      result = result.filter(profile => 
        profile.livingPreferences?.budget && profile.livingPreferences.budget <= budgetFilter
      );
    }

    // Cleanliness Filter
    if (cleanlinessFilter) {
      result = result.filter(profile => 
        profile.lifestyle?.cleanliness >= cleanlinessFilter
      );
    }

    // Sleep Filter
    if (sleepFilter) {
      result = result.filter(profile => 
        profile.lifestyle?.sleep === sleepFilter
      );
    }

    // Social Filter
    if (socialFilter) {
      result = result.filter(profile => 
        profile.lifestyle?.social === socialFilter
      );
    }

    // Neighborhoods Filter
    if (selectedNeighborhoods.length > 0) {
      result = result.filter(profile => 
        selectedNeighborhoods.some(neighbor => 
          profile.livingPreferences?.neighborhoods?.includes(neighbor)
        )
      );
    }

    // Sorting
    if (sortBy === "Most Compatible") {
      // Sort by highest cleanliness score
      result.sort((a, b) => 
        (b.lifestyle?.cleanliness || 0) - (a.lifestyle?.cleanliness || 0)
      );
    }

    setFilteredRoommates(result);
  }, [searchQuery, budgetFilter, cleanlinessFilter, sleepFilter, socialFilter, selectedNeighborhoods, sortBy, allRoommates]);

  const toggleNeighborhood = (neighborhood) => {
    setSelectedNeighborhoods(prev => 
      prev.includes(neighborhood) ? prev.filter(n => n !== neighborhood) : [...prev, neighborhood]
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search & Filter Bar */}
      <div className="relative z-[50] px-6 py-4 border-b border-[#283039] bg-background-dark">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-4 items-center">
          <div className="flex flex-1 w-full items-stretch rounded-xl h-12 bg-[#1c2127] border border-[#283039]">
            <div className="text-slate-400 flex items-center justify-center pl-4">
              <Search size={20} />
            </div>
            <input 
              className="w-full bg-transparent border-none focus:ring-0 text-base font-normal px-4 text-white" 
              placeholder="Search by name or username (regex supported)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto relative flex-wrap">
            {/* Budget Filter */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowBudgetMenu(!showBudgetMenu);
                  setShowCleanlinessMenu(false);
                  setShowSleepMenu(false);
                  setShowSocialMenu(false);
                  setShowNeighborhoodMenu(false);
                }}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full border px-4 transition-colors ${budgetFilter ? 'bg-primary/20 border-primary text-primary' : 'bg-[#1c2127] border-[#283039] text-white'}`}
              >
                <span className="text-sm font-medium">{budgetFilter ? `Up to $${budgetFilter}` : 'Budget'}</span>
                <ChevronDown size={16} />
              </button>
              {showBudgetMenu && (
                <div className="absolute top-full mt-2 left-0 w-64 bg-[#1c2127] border border-[#283039] rounded-xl shadow-2xl z-[60] p-4">
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span>$0</span>
                      <span>$5,000</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="5000" 
                      step="100"
                      value={budgetFilter || 5000}
                      onChange={(e) => setBudgetFilter(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <p className="text-center text-sm font-bold mt-2 text-primary">Up to ${budgetFilter || 5000}</p>
                  </div>
                  <button 
                    onClick={() => { setBudgetFilter(null); setShowBudgetMenu(false); }}
                    className="w-full text-center px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-lg text-sm font-bold"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>

            {/* Sleep Preference Filter */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowSleepMenu(!showSleepMenu);
                  setShowBudgetMenu(false);
                  setShowCleanlinessMenu(false);
                  setShowSocialMenu(false);
                  setShowNeighborhoodMenu(false);
                }}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full border px-4 transition-colors ${sleepFilter ? 'bg-primary/20 border-primary text-primary' : 'bg-[#1c2127] border-[#283039] text-white'}`}
              >
                <span className="text-sm font-medium">{sleepFilter ? `${sleepFilter}` : 'Sleep'}</span>
                <ChevronDown size={16} />
              </button>
              {showSleepMenu && (
                <div className="absolute top-full mt-2 left-0 w-48 bg-[#1c2127] border border-[#283039] rounded-xl shadow-2xl z-[60] p-2">
                  {["early", "late"].map(option => (
                    <button 
                      key={option}
                      onClick={() => { setSleepFilter(option); setShowSleepMenu(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-800 rounded-lg text-sm capitalize"
                    >
                      {option}
                    </button>
                  ))}
                  <button 
                    onClick={() => { setSleepFilter(null); setShowSleepMenu(false); }}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-lg text-sm mt-1"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Social Preference Filter */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowSocialMenu(!showSocialMenu);
                  setShowBudgetMenu(false);
                  setShowCleanlinessMenu(false);
                  setShowSleepMenu(false);
                  setShowNeighborhoodMenu(false);
                }}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full border px-4 transition-colors ${socialFilter ? 'bg-primary/20 border-primary text-primary' : 'bg-[#1c2127] border-[#283039] text-white'}`}
              >
                <span className="text-sm font-medium">{socialFilter ? `${socialFilter}` : 'Social'}</span>
                <ChevronDown size={16} />
              </button>
              {showSocialMenu && (
                <div className="absolute top-full mt-2 left-0 w-48 bg-[#1c2127] border border-[#283039] rounded-xl shadow-2xl z-[60] p-2">
                  {["quiet", "moderate", "social", "very social"].map(option => (
                    <button 
                      key={option}
                      onClick={() => { setSocialFilter(option); setShowSocialMenu(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-800 rounded-lg text-sm capitalize"
                    >
                      {option}
                    </button>
                  ))}
                  <button 
                    onClick={() => { setSocialFilter(null); setShowSocialMenu(false); }}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-lg text-sm mt-1"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Cleanliness Filter */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowCleanlinessMenu(!showCleanlinessMenu);
                  setShowBudgetMenu(false);
                  setShowSleepMenu(false);
                  setShowSocialMenu(false);
                  setShowNeighborhoodMenu(false);
                }}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full border px-4 transition-colors ${cleanlinessFilter ? 'bg-primary/20 border-primary text-primary' : 'bg-[#1c2127] border-[#283039] text-white'}`}
              >
                <span className="text-sm font-medium">{cleanlinessFilter ? `${cleanlinessFilter}+ Clean` : 'Cleanliness'}</span>
                <ChevronDown size={16} />
              </button>
              {showCleanlinessMenu && (
                <div className="absolute top-full mt-2 left-0 w-40 bg-[#1c2127] border border-[#283039] rounded-xl shadow-2xl z-[60] p-2">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button 
                      key={level}
                      onClick={() => { setCleanlinessFilter(level); setShowCleanlinessMenu(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-800 rounded-lg text-sm"
                    >
                      Level {level}+
                    </button>
                  ))}
                  <button 
                    onClick={() => { setCleanlinessFilter(null); setShowCleanlinessMenu(false); }}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-lg text-sm mt-1"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Neighborhoods Filter */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNeighborhoodMenu(!showNeighborhoodMenu);
                  setShowBudgetMenu(false);
                  setShowCleanlinessMenu(false);
                  setShowSleepMenu(false);
                  setShowSocialMenu(false);
                }}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full border px-4 transition-colors ${selectedNeighborhoods.length > 0 ? 'bg-primary/20 border-primary text-primary' : 'bg-[#1c2127] border-[#283039] text-white'}`}
              >
                <span className="text-sm font-medium">{selectedNeighborhoods.length > 0 ? `${selectedNeighborhoods.length} Areas` : 'Areas'}</span>
                <ChevronDown size={16} />
              </button>
              {showNeighborhoodMenu && (
                <div className="absolute top-full mt-2 right-0 w-64 bg-[#1c2127] border border-[#283039] rounded-xl shadow-2xl z-[60] p-3 space-y-1 max-h-64 overflow-y-auto">
                  {allNeighborhoods.length > 0 ? (
                    <>
                      {allNeighborhoods.map(area => (
                        <label key={area} className="flex items-center gap-3 cursor-pointer hover:bg-slate-800 p-2 rounded-lg transition-colors">
                          <input 
                            type="checkbox" 
                            checked={selectedNeighborhoods.includes(area)}
                            onChange={() => toggleNeighborhood(area)}
                            className="rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary"
                          />
                          <span className="text-sm">{area}</span>
                        </label>
                      ))}
                      <button 
                        onClick={() => { setSelectedNeighborhoods([]); setShowNeighborhoodMenu(false); }}
                        className="w-full text-left px-2 py-2 text-red-400 hover:bg-red-400/10 rounded-lg text-sm font-bold"
                      >
                        Clear All
                      </button>
                    </>
                  ) : (
                    <p className="text-slate-500 text-sm p-2">No neighborhoods available</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="relative z-0 flex flex-1 overflow-hidden">
        {/* Listings Section */}
        <section className="w-full flex flex-col flex-nowrap bg-[#0c1219] overflow-y-auto custom-scrollbar p-6 gap-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold">{filteredRoommates.length} Roommates found</h1>
            <div className="flex items-center gap-2 text-sm text-slate-400 relative">
              <span>Sort by:</span>
              <button 
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="font-bold text-white flex items-center gap-1"
              >
                {sortBy} <ChevronDown size={16} />
              </button>
              {showSortMenu && (
                <div className="absolute top-full mt-2 right-0 w-48 bg-[#1c2127] border border-[#283039] rounded-xl shadow-2xl z-[60] p-2">
                  {["Best Match", "Most Compatible"].map(option => (
                    <button 
                      key={option}
                      onClick={() => { setSortBy(option); setShowSortMenu(false); }}
                      className={`w-full text-left px-4 py-2 hover:bg-slate-800 rounded-lg text-sm ${sortBy === option ? 'text-primary font-bold' : 'text-white'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-red-400">
              <Search size={48} className="mb-4 opacity-20" />
              <p>Error loading roommates: {error}</p>
            </div>
          ) : filteredRoommates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Search size={48} className="mb-4 opacity-20" />
              <p>No roommates match your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRoommates.map(profile => (
                <RoommateCard key={profile._id} profile={profile} onClick={() => onViewDetail(profile.userId)} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default RoommateListings;
