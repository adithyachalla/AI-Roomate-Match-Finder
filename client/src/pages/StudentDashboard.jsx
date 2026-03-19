import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(undefined);

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
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    const stored = JSON.parse(localStorage.getItem("user"));

    await fetch("http://localhost:5001/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: stored.email })
    });

    const otp = prompt("Enter OTP to delete account:");
    if (!otp) return;

    const verify = await fetch("http://localhost:5001/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: stored.email, otp })
    });

    if (!verify.ok) {
      alert("Invalid OTP");
      return;
    }

    await fetch(`http://localhost:5001/api/user/delete/${stored._id}`, {
      method: "DELETE"
    });

    localStorage.clear();
    window.location.href = "/signup";
  };

  if (user === undefined) {
    return <div className="text-white p-10">Loading...</div>;
  }

  const isEmptyProfile = !user || Object.keys(user).length === 0;

  return (
    <div className="flex h-screen bg-background-dark text-white">

      {/* SIDEBAR */}
      <aside className="w-64 bg-card-dark border-r border-white/10 p-6 flex flex-col">

        {/* 🔥 LOGO */}
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
        <div className="space-y-4 text-sm">
          <button className="text-primary font-bold">Top Matches</button>
          <button className="hover:text-white text-slate-400">Browse Roommates</button>
          <button className="hover:text-white text-slate-400">Saved Profiles</button>
          <button className="hover:text-white text-slate-400">Conversations</button>
        </div>

        {/* PROFILE */}
        <div className="mt-auto pt-6 border-t border-white/10">

          <div className="flex items-center gap-3 mb-4">
            <img
              src={user?.profilePic?.trim() ? user.profilePic : "/default-avatar.png"}
              alt="profile"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">
                {user?.fullname || "Complete profile"}
              </p>
              <p className="text-xs text-slate-400">
                {user?.role || "student"}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/onboarding")}
            className="block w-full text-left mb-2 text-sm text-slate-300"
          >
            Edit Profile
          </button>

          <button
            onClick={logout}
            className="block w-full text-left mb-2 text-sm text-slate-300"
          >
            Logout
          </button>

          <button
            onClick={handleDeleteAccount}
            className="w-full bg-red-600 py-2 rounded-lg text-sm font-bold"
          >
            Delete Account
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* WARNING */}
        {isEmptyProfile && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded mb-6">
            Your profile is incomplete. Complete it to get better matches.
          </div>
        )}

        {/* PROFILE CARD */}
        <div className="bg-card-dark p-6 rounded-xl mb-6 border border-white/10">
          <h2 className="text-lg font-bold mb-4">Your Profile</h2>

          <div className="grid grid-cols-2 gap-4 text-sm">

            <p>
              <span className="text-slate-400">Budget:</span>{" "}
              {user?.livingPreferences?.budget ?? "Not set"}
            </p>

            <p>
              <span className="text-slate-400">Move-in:</span>{" "}
              {user?.livingPreferences?.moveIn || "Not set"}
            </p>

            <p>
              <span className="text-slate-400">Sleep:</span>{" "}
              {user?.lifestyle?.sleep || "Not set"}
            </p>

            <p>
              <span className="text-slate-400">Social:</span>{" "}
              {user?.lifestyle?.social || "Not set"}
            </p>

            <p>
              <span className="text-slate-400">Cleanliness:</span>{" "}
              {user?.lifestyle?.cleanliness ?? "Not set"}
            </p>

          </div>
        </div>

        {/* MATCHES */}
        <h1 className="text-2xl font-bold mb-4">
          Highly Compatible
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {[1,2,3].map((i) => (
            <div
              key={i}
              className="bg-card-dark rounded-xl border border-white/10 p-4 hover:scale-[1.02] transition"
            >
              <img
                src="/default-avatar.png"
                alt="match"
                className="h-40 w-full rounded-lg mb-4 object-cover"
              />

              <h3 className="font-bold text-lg mb-1">
                Match {i}
              </h3>

              <p className="text-sm text-slate-400 mb-3">
                Compatible roommate profile
              </p>

              <button className="w-full bg-primary py-2 rounded-lg font-bold">
                View Profile
              </button>
            </div>
          ))}

        </div>

      </main>
    </div>
  );
}