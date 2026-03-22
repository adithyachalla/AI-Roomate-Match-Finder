import { motion } from "framer-motion";
import { ArrowLeft, Award, Home, LinkIcon, Mail, MapPin, Moon, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const RoommateDetail = ({ roommateId, onBack }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch by userId (roommateId is userId)
        const response = await fetch(`http://localhost:5001/api/profile/${roommateId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data = await response.json();
        
        if (!data || Object.keys(data).length === 0) {
          throw new Error("Profile not found");
        }
        
        setProfile(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (roommateId) {
      fetchProfile();
    }
  }, [roommateId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400">
        <p className="mb-4">Error: {error || "Profile not found"}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0c1219] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-white hover:text-primary transition text-2xl"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{profile.fullname || "Anonymous"}</h1>
          <p className="text-sm text-slate-400">@{profile.username || "user"}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          {/* Profile Image Card */}
          <div className="bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-blue-500/30 rounded-2xl overflow-hidden h-80 flex items-center justify-center border border-white/10">
            <img
              src={profile.profilePic || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
              alt={profile.fullname}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Bio Section */}
          {profile.bio && (
            <div className="bg-[#1c2127] rounded-xl p-6 border border-[#283039]">
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <LinkIcon size={20} className="text-primary" />
                About
              </h2>
              <p className="text-slate-300 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Lifestyle Preferences */}
          <div className="bg-[#1c2127] rounded-xl p-6 border border-[#283039]">
            <h2 className="text-lg font-bold text-white mb-4">Lifestyle</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sleep Schedule */}
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <Moon size={20} className="text-yellow-400" />
                  <p className="text-sm text-slate-400">Sleep Schedule</p>
                </div>
                <p className="text-lg font-bold text-white capitalize">
                  {profile.lifestyle?.sleep || "Not specified"}
                </p>
              </div>

              {/* Social Type */}
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <Users size={20} className="text-pink-400" />
                  <p className="text-sm text-slate-400">Social Type</p>
                </div>
                <p className="text-lg font-bold text-white capitalize">
                  {profile.lifestyle?.social || "Not specified"}
                </p>
              </div>

              {/* Cleanliness */}
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <Award size={20} className="text-green-400" />
                  <p className="text-sm text-slate-400">Cleanliness</p>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full ${
                        i < (profile.lifestyle?.cleanliness || 0) ? 'bg-green-400' : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2">Level {profile.lifestyle?.cleanliness || 0}/5</p>
              </div>
            </div>
          </div>

          {/* Living Preferences */}
          <div className="bg-[#1c2127] rounded-xl p-6 border border-[#283039]">
            <h2 className="text-lg font-bold text-white mb-4">Living Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Budget */}
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">💰</span>
                  <p className="text-sm text-slate-400">Budget</p>
                </div>
                <p className="text-xl font-bold text-white">
                  ${profile.livingPreferences?.budget || "Not specified"}
                  {profile.livingPreferences?.budget && "/month"}
                </p>
              </div>

              {/* Move-in Date */}
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📅</span>
                  <p className="text-sm text-slate-400">Move-in Date</p>
                </div>
                <p className="text-lg font-bold text-white">
                  {profile.livingPreferences?.moveIn || "Flexible"}
                </p>
              </div>

              {/* Entire Unit Preference */}
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <Home size={20} className="text-blue-400" />
                  <p className="text-sm text-slate-400">Living Type</p>
                </div>
                <p className="text-lg font-bold text-white capitalize">
                  {profile.livingPreferences?.entireUnit ? "Entire Unit" : "Shared Space"}
                </p>
              </div>

              {/* Neighborhoods */}
              {profile.livingPreferences?.neighborhoods && profile.livingPreferences.neighborhoods.length > 0 && (
                <div className="bg-white/5 p-4 rounded-lg border border-white/10 md:col-span-1">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin size={20} className="text-red-400" />
                    <p className="text-sm text-slate-400">Interested Areas</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.livingPreferences.neighborhoods.map((area, idx) => (
                      <span key={idx} className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Actions */}
          <div className="bg-[#1c2127] rounded-xl p-6 border border-[#283039] flex gap-3">
            <button 
              onClick={() => navigate('/student-dashboard', { 
                state: { 
                  roommateId: profile.userId, 
                  roommateName: profile.fullname,
                  openConversation: true
                } 
              })}
              className="flex-1 bg-primary text-white py-3 rounded-lg font-bold hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <Mail size={18} />
              Send Message
            </button>
            <button onClick={onBack} className="flex-1 bg-slate-700/50 text-white py-3 rounded-lg font-bold hover:bg-slate-700/70 transition">
              Back
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RoommateDetail;
