import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { StudentMessagesTab } from "./components/StudentMessagesTab";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(undefined);
  const [topProfiles, setTopProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Check if coming from roommate detail with state
  useEffect(() => {
    if (location.state?.roommateId && location.state?.roommateName) {
      setActiveTab("conversations");
      // Clear the state after using it
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ✅ FIXED useEffect
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));

    if (!stored?._id) {
      setUser({});
      return;
    }

    fetch(`http://localhost:5001/api/profile/${stored._id}`)
      .then(res => (res.ok ? res.json() : {}))
      .then(data => setUser(data || {}))
      .catch(() => setUser({}));

    // Fetch top 10 similar profiles
    setLoadingProfiles(true);
    fetch(`http://localhost:5001/api/profile/similar/top/${stored._id}`)
      .then(res => (res.ok ? res.json() : []))
      .then(data => setTopProfiles(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error("Error fetching similar profiles:", err);
        setTopProfiles([]);
      })
      .finally(() => setLoadingProfiles(false));
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ✅ SWITCH ROLE FUNCTION
  const toggleRole = () => {
    const currentRole = user?.role || "student";

    if (currentRole === "student") {
      navigate("/owner-dashboard");
    } else {
      navigate("/student-dashboard");
    }
  };

  // ✅ DELETE ACCOUNT
  const handleDeleteAccount = async () => {
    try {
      const stored = JSON.parse(localStorage.getItem("user"));

      if (!stored?.email || !stored?._id) {
        alert("User session missing. Please login again.");
        return;
      }

      await fetch("http://localhost:5001/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: stored.email })
      });

      const otp = prompt("Enter OTP to delete account:");
      if (!otp) return;

      const verify = await fetch("http://localhost:5001/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: stored.email,
          otp
        })
      });

      if (!verify.ok) {
        alert("Invalid OTP");
        return;
      }

      await fetch(`http://localhost:5001/api/user/delete/${stored._id}`, {
        method: "DELETE"
      });

      localStorage.clear();
      alert("Account deleted successfully");
      window.location.href = "/signup";

    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  if (user === undefined) {
    return <div className="text-white p-10">Loading...</div>;
  }

  const isEmptyProfile = !user || Object.keys(user).length === 0;

  return (
    <div className="flex h-screen bg-background-dark text-white">

      {/* SIDEBAR */}
 <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-white/10 p-6 flex flex-col">

  {/* LOGO */}
  <div className="flex items-center gap-3 mb-10">
    <div className="relative w-8 h-8">
      <div className="absolute inset-0 border-[3px] border-white/20 rounded-md rotate-45 -translate-x-1 -translate-y-1"></div>
      <div className="absolute inset-0 border-[3px] border-accent-teal rounded-md rotate-45 translate-x-1 translate-y-1"></div>
    </div>

    <h2 className="text-white text-xl font-black tracking-tight">
      Room<span className="text-accent-teal">Sync</span>
    </h2>
  </div>

  {/* NAV */}
  <div className="space-y-3 text-sm">

    <button 
      onClick={() => setActiveTab("dashboard")}
      className={`w-full text-left px-3 py-2 rounded-lg transition ${activeTab === "dashboard" ? "bg-primary/10 text-primary font-bold" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
    >
      Top Matches
    </button>

    <button 
      onClick={() => navigate("/browse-roommates")}
      className="w-full text-left px-3 py-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition"
    >
      Browse Roommates
    </button>

    <button className="w-full text-left px-3 py-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition">
      Saved Profiles
    </button>

    <button 
      onClick={() => setActiveTab("conversations")}
      className={`w-full text-left px-3 py-2 rounded-lg transition ${activeTab === "conversations" ? "bg-primary/10 text-primary font-bold" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
    >
      Conversations
    </button>

  </div>

  {/* PROFILE SECTION */}
  <div className="mt-auto pt-6 border-t border-white/10">

    {/* USER INFO */}
    <div className="flex items-center gap-3 mb-5">
      <img
        src={user?.profilePic || "/default-avatar.png"}
        alt="profile"
        className="w-12 h-12 rounded-full border border-white/20 object-cover"
      />

      <div>
        <p className="text-sm font-semibold text-white">
          {user?.fullname || "User"}
        </p>
        <p className="text-xs text-slate-400">
          {user?.role || "student"}
        </p>
      </div>
    </div>

    {/* ACTIONS */}
<div className="space-y-3">

  {/* EDIT PROFILE */}
  <button
    onClick={() => navigate("/onboarding")}
    className="w-full flex items-center justify-center gap-2 border border-white/10 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition"
  >
    ✏️ Edit Profile
  </button>

  {/* SWITCH ROLE */}
  <button
    onClick={toggleRole}
    className="w-full bg-primary text-white py-2 rounded-xl text-sm font-bold shadow-md hover:scale-[1.02] transition"
  >
    Switch Role
  </button>

  {/* LOGOUT */}
  <button
    onClick={logout}
    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition"
  >
    🚪 Logout
  </button>

  {/* DELETE */}
  <button
    onClick={handleDeleteAccount}
    className="w-full bg-red-600 text-white py-2 rounded-xl text-sm font-bold shadow-md hover:bg-red-700 transition"
  >
    Delete Account
  </button>

</div>
  </div>
</aside>

      {/* MAIN */}
      <main className="flex-1 p-8 overflow-y-auto">

        {activeTab === "dashboard" && (
          <>
        {isEmptyProfile && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded mb-6">
            Your profile is incomplete. Complete it to get better matches.
          </div>
        )}

        {/* PROFILE CARD */}
<div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl mb-6 border border-white/10 shadow-xl">

  {/* Header */}
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-bold text-white">
      Your Profile
    </h2>

    <div className="text-xs px-3 py-1 bg-primary/20 text-primary rounded-full font-semibold">
      Active
    </div>
  </div>

  {/* Grid */}
  <div className="grid grid-cols-2 gap-6 text-sm">

    {/* Budget */}
    <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-3">
      <span className="text-xl">💰</span>
      <div>
        <p className="text-slate-400 text-xs">Budget</p>
        <p className="text-lg font-bold text-white">
          ${user?.livingPreferences?.budget ?? "Not set"}
        </p>
      </div>
    </div>

    {/* Move-in */}
    <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-3">
      <span className="text-xl">📅</span>
      <div>
        <p className="text-slate-400 text-xs">Move-in</p>
        <p className="text-lg font-bold text-white">
          {user?.livingPreferences?.moveIn || "Not set"}
        </p>
      </div>
    </div>

    {/* Sleep */}
    <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-3">
      <span className="text-xl">🌙</span>
      <div>
        <p className="text-slate-400 text-xs">Sleep</p>
        <p className="text-lg font-bold text-white capitalize">
          {user?.lifestyle?.sleep || "Not set"}
        </p>
      </div>
    </div>

    {/* Social */}
    <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-3">
      <span className="text-xl">👥</span>
      <div>
        <p className="text-slate-400 text-xs">Social</p>
        <p className="text-lg font-bold text-white capitalize">
          {user?.lifestyle?.social || "Not set"}
        </p>
      </div>
    </div>

    {/* Cleanliness */}
    <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-3 col-span-2">
      <span className="text-xl">🧼</span>
      <div>
        <p className="text-slate-400 text-xs">Cleanliness</p>
        <p className="text-lg font-bold text-white">
          Level {user?.lifestyle?.cleanliness ?? "Not set"}
        </p>
      </div>
    </div>

  </div>
</div>

        {/* MATCHES */}
        <h1 className="text-2xl font-bold mb-4">
          Highly Compatible
        </h1>

        {loadingProfiles && (
          <div className="text-slate-400 text-center py-8">
            Loading top matches...
          </div>
        )}

        {!loadingProfiles && topProfiles.length === 0 && (
          <div className="bg-slate-800/50 border border-white/10 p-6 rounded-lg text-center">
            <p className="text-slate-400 mb-2">No similar profiles found yet</p>
            <p className="text-xs text-slate-500">Complete your profile to get better matches!</p>
          </div>
        )}

        {!loadingProfiles && topProfiles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topProfiles.map((profile, index) => (
              <div
                key={profile._id || index}
                className="bg-card-dark rounded-xl border border-white/10 p-4 hover:scale-[1.03] transition shadow-lg hover:border-primary/40 cursor-pointer"
                onClick={() => navigate(`/roommate/${profile._id}`, { state: { roommateId: profile._id, roommateName: profile.fullname } })}
              >
                {/* Avatar + Gradient */}
                <div className="h-40 rounded-lg mb-4 flex items-center justify-center bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-blue-500/30 overflow-hidden">
                  <img
                    src={profile.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                    alt={profile.fullname}
                    className="w-20 h-20 rounded-full bg-white object-cover"
                  />
                </div>

                {/* Name */}
                <h3 className="font-bold text-lg mb-1 text-white">
                  {profile.fullname || "User"}
                </h3>

                {/* Username */}
                <p className="text-xs text-slate-500 mb-2">
                  @{profile.username || "user"}
                </p>

                {/* Bio */}
                <p className="text-sm text-slate-400 mb-3 line-clamp-2 min-h-[2.5rem]">
                  {profile.bio || "No bio added"}
                </p>

                {/* Compatibility badge */}
                <div className="text-sm text-green-400 mb-3 font-semibold bg-green-400/10 px-3 py-1 rounded-full inline-block">
                  ⭐ {profile.compatibilityScore || 0}% Match
                </div>

                {/* Quick stats grid */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                    <p className="text-slate-500">Budget</p>
                    <p className="font-bold text-white">${profile.livingPreferences?.budget || "N/A"}</p>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                    <p className="text-slate-500">Sleep</p>
                    <p className="font-bold text-white capitalize">{profile.lifestyle?.sleep || "N/A"}</p>
                  </div>
                </div>

                {/* Button */}
                <button 
                  className="w-full bg-primary py-2 rounded-lg font-bold hover:opacity-90 transition text-white"
                  onClick={() => navigate(`/roommate/${profile._id}`, { state: { roommateId: profile._id, roommateName: profile.fullname } })}
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
          </>
        )}

        {activeTab === "conversations" && (
          <StudentMessagesTab />
        )}

      </main>
    </div>
  );
}