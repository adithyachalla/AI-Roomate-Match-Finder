import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentVerification({ next }) {
  const [university, setUniversity] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  return (
    <div className="bg-background-dark text-slate-100 min-h-screen flex flex-col items-center justify-center px-6 py-12 relative">

      {/* EXIT BUTTON (Top Right) */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 right-6 text-slate-500 hover:text-white text-sm font-bold flex items-center gap-1 transition"
      >
        <span className="material-symbols-outlined text-lg">close</span>
        Exit
      </button>

      {/* LOGO + STEP BADGE */}
      <div className="mb-10 flex flex-col items-center">
        <div className="flex items-center gap-4 mb-4">

          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border-[3px] border-white/20 rounded-md rotate-45 -translate-x-1 -translate-y-1"></div>
            <div className="absolute inset-0 border-[3px] border-accent-teal rounded-md rotate-45 translate-x-1 translate-y-1"></div>
          </div>

          <h2 className="text-white text-2xl font-black tracking-tight">
            Room<span className="text-accent-teal">Sync</span>
          </h2>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
          Step 1 of 6: Student Verification
        </div>
      </div>

      {/* CARD */}
      <div className="w-full max-w-[520px] bg-card-dark border border-white/10 rounded-[2.5rem] p-10 lg:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent-teal"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -mr-16 -mt-16" />

        <div className="relative z-10 space-y-8">

          <div>
            <h1 className="text-3xl lg:text-4xl font-black">
              Student Verification
            </h1>
            <p className="text-slate-400 font-medium">
              Please verify your student status to start matching with peers.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest ml-1">
              Select University
            </label>
            <input
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="Search for your university..."
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest ml-1">
              Student Email (.edu)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@university.edu"
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          <button
            onClick={next}
            className="w-full bg-primary hover:bg-primary/90 text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
          >
            Send Verification Code
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>

          <div className="pt-6 border-t border-white/5 flex items-center gap-4">
            <div className="size-10 rounded-full bg-white/5 flex items-center justify-center text-accent-teal">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              We only accept verified .edu email addresses to ensure a safe student-only community.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
