import { useState } from "react";

export default function AccountCreation({ next, back }) {
  const [form, setForm] = useState({
    fullname: "",
    username: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen bg-background-dark text-slate-100 flex flex-col">

      {/* LOGO HEADER */}
      <div className="flex justify-center pt-12 pb-6">
        <div className="flex items-center gap-3">

          {/* RoomSync Diamond Logo */}
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border-[3px] border-white/20 rounded-md rotate-45 -translate-x-1 -translate-y-1"></div>
            <div className="absolute inset-0 border-[3px] border-accent-teal rounded-md rotate-45 translate-x-1 translate-y-1"></div>
          </div>

          <h2 className="text-white text-2xl font-black tracking-tight">
            Room<span className="text-accent-teal">Sync</span>
          </h2>
        </div>
      </div>

      {/* STEP BADGE */}
      <div className="flex justify-center mb-8">
        <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
          Step 2 of 6 : Account Creation
        </div>
      </div>

      {/* FORM CARD */}
      <div className="flex-1 flex justify-center px-6">
        <div className="w-full max-w-md bg-card-dark border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">

          {/* Top Gradient Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent-teal" />

          <h1 className="text-2xl font-black mb-2">Complete your profile</h1>
          <p className="text-slate-400 mb-6">
            Just a few more details to find your match.
          </p>

          <div className="space-y-5">

            {/* FULL NAME */}
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                Full Name
              </label>
              <div className="relative mt-2">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  person
                </span>
                <input
                  name="fullname"
                  value={form.fullname}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* USERNAME */}
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                Username
              </label>
              <div className="relative mt-2">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  alternate_email
                </span>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Choose a unique username"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                Create Password
              </label>
              <div className="relative mt-2">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  lock
                </span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              By clicking Create Account, you agree to RoomSync's{" "}
              <span className="text-primary hover:underline cursor-pointer">Terms</span>{" "}
              and{" "}
              <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>.
            </p>

            {/* CREATE ACCOUNT BUTTON */}
            <button
              onClick={next}
              className="w-full h-16 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/25 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Create Account
            </button>

            {/* BACK BUTTON */}
            <button
              onClick={back}
              className="w-full py-3 text-slate-500 hover:text-white text-sm font-bold transition-all"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>

      {/* BACKGROUND GLOW */}
      <div className="fixed top-1/4 -left-20 size-96 bg-primary/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
      <div className="fixed bottom-1/4 -right-20 size-96 bg-accent-teal/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
    </div>
  );
}
