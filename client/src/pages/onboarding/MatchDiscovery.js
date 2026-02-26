import { useState } from "react";

export default function ProfileCustomization({ next }) {
  const [bio, setBio] = useState("");

  return (
    <div className="min-h-screen bg-background-dark text-white flex flex-col items-center justify-center px-6 py-12">

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
          Step 5 of 5: Profile Customization
        </div>
      </div>

      {/* CARD */}
      <div className="w-full max-w-xl bg-card-dark rounded-2xl shadow-2xl p-10 border border-white/5">

        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">
            Personalize Your Profile
          </h1>
          <p className="text-slate-400 text-sm">
            Add the finishing touches to your AI-powered roommate profile.
          </p>
        </div>

        <div className="space-y-8">

          {/* PROFILE PHOTO */}
          <section className="flex flex-col items-center">
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary/80 mb-4">
              Profile Photo
            </h3>

            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center bg-white/[0.02] hover:bg-white/[0.05] transition-all">
                <span className="material-symbols-outlined text-3xl text-slate-500">
                  add_a_photo
                </span>
              </div>
              <div className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full flex items-center justify-center border-4 border-card-dark">
                <span className="material-symbols-outlined text-xs text-white">
                  edit
                </span>
              </div>
            </div>
          </section>

          {/* ABOUT ME */}
          <section>
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary/80 mb-3">
              About Me
            </h3>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell potential roommates about yourself, your major, and what you're looking for..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-sm text-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[100px] resize-none placeholder:text-slate-600"
            />
          </section>

          {/* INTERESTS */}
          <section>
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary/80 mb-4">
              My Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {["Gaming", "Cooking", "Fitness", "Traveling", "Music", "Art"].map((item) => (
                <button
                  key={item}
                  className="px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] text-xs font-bold text-slate-400 hover:border-primary/50 hover:bg-primary/10 hover:text-white transition-all"
                >
                  {item}
                </button>
              ))}
              <button className="px-4 py-2 rounded-full border border-dashed border-white/10 text-xs font-bold text-slate-500 hover:border-primary/50 transition-all">
                + Add More
              </button>
            </div>
          </section>

          {/* LIVING HABITS PREVIEW */}
          <section className="p-5 rounded-xl border border-white/5 bg-white/[0.01]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary/80">
                Living Habits
              </h3>
              <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider">
                Manage Preferences
              </button>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 rounded-lg text-slate-300">
                🌙 Night Owl
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 rounded-lg text-slate-300">
                👥 Social
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 rounded-lg text-slate-300">
                🧼 Balanced
              </span>
            </div>
          </section>
        </div>

        {/* BUTTON */}
        <div className="mt-10">
          <button
            onClick={next}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-full transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
          >
            Complete Setup
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>

          <p className="text-center text-slate-600 text-[11px] mt-6 uppercase tracking-[0.1em] font-medium">
            Step 4 of 5: Finalize your matching profile
          </p>
        </div>
      </div>
    </div>
  );
}
