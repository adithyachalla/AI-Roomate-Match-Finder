import { motion } from "framer-motion";
import { Award, Heart, Moon, Users } from "lucide-react";
import { useState } from "react";

const RoommateCard = ({ profile, onClick, onFavoriteToggle, isFavorited }) => {
  const [isFavorite, setIsFavorite] = useState(isFavorited || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    setIsLoading(true);

    try {
      const stored = JSON.parse(localStorage.getItem("user"));
      const userId = stored?._id;

      if (!userId) {
        console.error("User not logged in");
        alert("Please log in first");
        setIsLoading(false);
        return;
      }

      if (!profile._id) {
        console.error("Profile ID missing:", profile);
        alert("Error: Profile information missing");
        setIsLoading(false);
        return;
      }

      const endpoint = isFavorite
        ? `http://localhost:5001/api/profile/unsave/${userId}/${profile._id}`
        : `http://localhost:5001/api/profile/save/${userId}/${profile._id}`;

      const method = isFavorite ? "DELETE" : "POST";

      console.log(`${method} request to:`, endpoint);

      const response = await fetch(endpoint, { method });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = `API error: ${response.status}`;
        
        if (contentType?.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            console.error("Failed to parse error JSON:", e);
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Response:", data);

      if (isFavorite) {
        setIsFavorite(false);
        if (onFavoriteToggle) onFavoriteToggle(profile._id, false);
      } else {
        setIsFavorite(true);
        if (onFavoriteToggle) onFavoriteToggle(profile._id, true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex flex-col shrink-0 bg-[#1c2127] rounded-xl overflow-hidden border border-[#283039] transition-all hover:shadow-xl hover:border-primary/40 cursor-pointer"
      onClick={onClick}
    >
      {/* Profile Image Section */}
      <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-blue-500/30 flex items-center justify-center">
        <img 
          src={profile.profilePic || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"} 
          alt={profile.fullname}
          className="w-full h-full object-cover"
        />
        
        {/* Like Button */}
        <button 
          onClick={handleFavoriteClick}
          disabled={isLoading}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md text-white border opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 ${
            isFavorite 
              ? 'bg-red-500/60 border-red-500' 
              : 'bg-black/40 border-white/10 hover:bg-red-500/60 hover:border-red-500'
          }`}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1">
        {/* Name */}
        <h3 className="font-bold text-lg text-white mb-1">
          {profile.fullname || "Anonymous"}
        </h3>

        {/* Username */}
        <p className="text-xs text-slate-400 mb-3">
          @{profile.username || "user"}
        </p>

        {/* Bio */}
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">
          {profile.bio || "No bio added"}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          {/* Budget */}
          <div className="bg-white/5 p-2 rounded-lg border border-white/10 flex items-center gap-2">
            <span className="text-lg">💰</span>
            <div>
              <p className="text-slate-500">Budget</p>
              <p className="font-bold text-white">
                ${profile.livingPreferences?.budget || "N/A"}
              </p>
            </div>
          </div>

          {/* Move-in */}
          <div className="bg-white/5 p-2 rounded-lg border border-white/10 flex items-center gap-2">
            <span className="text-lg">📅</span>
            <div>
              <p className="text-slate-500">Move-in</p>
              <p className="font-bold text-white text-xs">
                {profile.livingPreferences?.moveIn ? profile.livingPreferences.moveIn.split('-')[0] : "N/A"}
              </p>
            </div>
          </div>

          {/* Sleep */}
          <div className="bg-white/5 p-2 rounded-lg border border-white/10 flex items-center gap-2">
            <Moon size={14} className="text-yellow-400" />
            <div>
              <p className="text-slate-500">Sleep</p>
              <p className="font-bold text-white capitalize">
                {profile.lifestyle?.sleep || "N/A"}
              </p>
            </div>
          </div>

          {/* Social */}
          <div className="bg-white/5 p-2 rounded-lg border border-white/10 flex items-center gap-2">
            <Users size={14} className="text-pink-400" />
            <div>
              <p className="text-slate-500">Social</p>
              <p className="font-bold text-white capitalize">
                {profile.lifestyle?.social || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Cleanliness */}
        <div className="bg-white/5 p-2 rounded-lg border border-white/10 flex items-center gap-2 mb-4">
          <Award size={16} className="text-green-400" />
          <div className="flex-1">
            <p className="text-xs text-slate-500">Cleanliness Level</p>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < (profile.lifestyle?.cleanliness || 0) ? 'bg-green-400' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1">{profile.lifestyle?.cleanliness || 0}/5</p>
          </div>
        </div>

        {/* Neighborhoods */}
        {profile.livingPreferences?.neighborhoods && profile.livingPreferences.neighborhoods.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-2">Interested Areas</p>
            <div className="flex flex-wrap gap-1">
              {profile.livingPreferences.neighborhoods.slice(0, 3).map((area, idx) => (
                <span key={idx} className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                  {area}
                </span>
              ))}
              {profile.livingPreferences.neighborhoods.length > 3 && (
                <span className="px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded-full">
                  +{profile.livingPreferences.neighborhoods.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* View Profile Button */}
        <button className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:opacity-90 transition mt-auto">
          View Profile
        </button>
      </div>
    </motion.div>
  );
};

export default RoommateCard;
