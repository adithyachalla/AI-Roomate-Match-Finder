import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Role({ next }) {
  const [role, setRole] = useState("student");
  const navigate = useNavigate();

  const handleContinue = () => {
    if (role === "owner") {
      navigate("/owner-dashboard");
    } else {
      next(); // student flow route
    }
  };

  return (
    <div className="bg-background-dark text-slate-100 min-h-screen flex flex-col items-center justify-center px-6 py-12">

      {/* LOGO + HEADER */}
      <div className="mb-10 flex flex-col items-center">
        <div className="flex items-center gap-4 mb-4">

          {/* RoomSync Diamond Logo */}
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border-[3px] border-white/20 rounded-md rotate-45 -translate-x-1 -translate-y-1"></div>
            <div className="absolute inset-0 border-[3px] border-accent-teal rounded-md rotate-45 translate-x-1 translate-y-1"></div>
          </div>

          <h2 className="text-white text-2xl font-black tracking-tight">
            Room<span className="text-accent-teal">Sync</span>
          </h2>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
          Step 3 OF 6: Personalize your experience
        </div>
      </div>

      {/* CARD */}
      <div className="w-full max-w-2xl bg-card-dark border border-white/10 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent-teal"></div>

        <div className="mb-10 text-center">
          <h1 className="text-2xl lg:text-3xl font-black text-white mb-3 tracking-tight">
            Tell us how you'll use RoomSync
          </h1>
          <p className="text-slate-400 font-medium">
            Select your role to help us tailor your experience.
          </p>
        </div>

        {/* ROLE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

          {/* STUDENT */}
          <button
            onClick={() => setRole("student")}
            className={`group flex flex-col items-center text-center p-8 rounded-3xl transition-all duration-300 border ${
              role === "student"
                ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                : "border-white/10 bg-white/5 hover:border-primary/50 hover:bg-white/[0.08]"
            }`}
          >
            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">
                school
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">I'm a Student</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Looking for a home or a roommate to share a space with.
            </p>
          </button>

          {/* PROPERTY OWNER */}
          <button
            onClick={() => setRole("owner")}
            className={`group flex flex-col items-center text-center p-8 rounded-3xl transition-all duration-300 border ${
              role === "owner"
                ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                : "border-white/10 bg-white/5 hover:border-primary/50 hover:bg-white/[0.08]"
            }`}
          >
            <div className="size-16 rounded-2xl bg-accent-teal/10 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-accent-teal text-3xl">
                real_estate_agent
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              I'm a Property Owner
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Listing a room, apartment, or property for student rental.
            </p>
          </button>
        </div>

        {/* CONTINUE */}
        <div className="space-y-4">
          <button
            onClick={handleContinue}
            className="w-full h-16 rounded-2xl bg-primary text-white text-lg font-black shadow-xl shadow-primary/25 hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.98] transition-all"
          >
            Continue
          </button>

          <p className="text-center text-[12px] text-slate-500 font-medium">
            Choosing "Property Owner" will skip roommate matching.
          </p>
        </div>
      </div>
    </div>
  );
}
