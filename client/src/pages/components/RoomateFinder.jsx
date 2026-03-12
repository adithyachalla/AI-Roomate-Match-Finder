import React, { useState, useEffect } from "react";
import { Sparkles, Target } from "lucide-react";
import { motion } from "framer-motion";
import { getRoommateCompatibility } from "../../services/utility";

const RoommateFinder = () => {
  const [roommates, setRoommates] = useState([]);
  const [aiResult, setAiResult] = useState({});
  const [loadingAi, setLoadingAi] = useState({});

  useEffect(() => {
    fetch("http://localhost:5000/api/roommates").then(res => res.json()).then(setRoommates);
  }, []);

  const checkCompatibility = async (roommate) => {
    setLoadingAi(prev => ({ ...prev, [roommate.id]: true }));
    try {
      const userProfile = "I am a quiet student who studies a lot and sleeps early. I like a clean kitchen.";
      const result = await getRoommateCompatibility(userProfile, JSON.stringify(roommate));
      setAiResult(prev => ({ ...prev, [roommate.id]: result }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(prev => ({ ...prev, [roommate.id]: false }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-4">Find Your Perfect Roommate</h1>
        <p className="text-slate-500 text-lg">Our AI matches you with people who share your lifestyle and habits.</p>
      </div>

      <div className="grid gap-6">
        {roommates.map(roommate => (
          <motion.div 
            key={roommate.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-6 items-center"
          >
            <div className="w-24 h-24 rounded-full border-4 border-primary/20 p-1 flex-shrink-0">
              <img src={roommate.avatar_url} alt={roommate.name} className="w-full h-full rounded-full bg-slate-800 object-cover" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-white">{roommate.name}</h3>
                <div className="flex items-center gap-1 text-accent-teal bg-accent-teal/10 px-3 py-1 rounded-full w-fit mx-auto md:mx-0">
                  <Sparkles size={14} />
                  <span className="text-sm font-extrabold">{roommate.sync_score}% Sync Score</span>
                </div>
              </div>
              <p className="text-slate-400 mb-4">{roommate.bio}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                {Object.entries(roommate.lifestyle).map(([key, value]) => (
                  <span key={key} className="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-slate-300">
                    {key}: {value}
                  </span>
                ))}
              </div>

              {aiResult[roommate.id] && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/5 border border-primary/20 p-4 rounded-xl text-sm mb-4"
                >
                  <div className="flex items-center gap-2 text-primary font-bold mb-1">
                    <Target size={16} /> AI Compatibility Check: {aiResult[roommate.id].score}%
                  </div>
                  <p className="text-slate-300 mb-2">{aiResult[roommate.id].reasoning}</p>
                  <p className="text-xs text-slate-500 font-medium">💡 Tip: {aiResult[roommate.id].tips}</p>
                </motion.div>
              )}
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <button 
                onClick={() => checkCompatibility(roommate)}
                disabled={loadingAi[roommate.id]}
                className="bg-primary/10 text-primary font-bold px-6 py-3 rounded-xl hover:bg-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingAi[roommate.id] ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div> : <Sparkles size={18} />}
                Check AI Sync
              </button>
              <button className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                Connect
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RoommateFinder;
