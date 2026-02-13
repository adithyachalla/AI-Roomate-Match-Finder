import { useState } from "react";

export default function LifestylePreferences({ next, back }) {
  const [sleep, setSleep] = useState("night");
  const [social, setSocial] = useState("social");
  const [cleanliness, setCleanliness] = useState(2);

  return (
    <div className="bg-background-dark text-white min-h-screen flex flex-col items-center justify-center px-6 py-12">

      {/* LOGO + TITLE */}
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
          Step 5 of 6: Lifestyle Setup
        </div>
      </div>

      {/* CARD */}
      <div className="w-full max-w-xl bg-card-dark rounded-[2.5rem] shadow-2xl p-10 border border-white/5">

        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold mb-2">
           Personalize Your Match
          </h1>
          <p className="text-slate-400 text-sm">
            Define your daily rhythm to help our AI find your ideal roommate.
          </p>
        </div>

        <div className="space-y-10">

          {/* Sleep */}
          <section>
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary/80 mb-6 text-center">
              Sleep Schedule
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSleep("early")}
                className={`p-6 rounded-xl border transition-all ${
                  sleep === "early"
                    ? "border-primary bg-primary/10"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <span className="material-symbols-outlined text-orange-400 text-3xl mb-2">
                  wb_sunny
                </span>
                <p className="font-bold text-sm">Early Bird</p>
              </button>

              <button
                onClick={() => setSleep("night")}
                className={`p-6 rounded-xl border transition-all ${
                  sleep === "night"
                    ? "border-primary bg-primary/10"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <span className="material-symbols-outlined text-primary text-3xl mb-2">
                  dark_mode
                </span>
                <p className="font-bold text-sm">Night Owl</p>
              </button>
            </div>
          </section>

          {/* Social */}
          <section>
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary/80 mb-6 text-center">
              Social Battery
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSocial("social")}
                className={`p-6 rounded-xl border transition-all ${
                  social === "social"
                    ? "border-primary bg-primary/10"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <span className="material-symbols-outlined text-primary text-3xl mb-2">
                  groups
                </span>
                <p className="font-bold text-sm">Social</p>
              </button>

              <button
                onClick={() => setSocial("private")}
                className={`p-6 rounded-xl border transition-all ${
                  social === "private"
                    ? "border-primary bg-primary/10"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <span className="material-symbols-outlined text-purple-400 text-3xl mb-2">
                  person_off
                </span>
                <p className="font-bold text-sm">Private</p>
              </button>
            </div>
          </section>

          {/* Cleanliness */}
          <section>
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary/80 mb-6 text-center">
              Cleanliness Level
            </h3>
            <input
              type="range"
              min="1"
              max="3"
              step="1"
              value={cleanliness}
              onChange={(e) => setCleanliness(e.target.value)}
              className="w-full accent-primary"
            />
          </section>
        </div>

        {/* Buttons */}
        <div className="mt-12 space-y-4">
          <button
            onClick={next}
            className="w-full bg-primary text-white font-bold py-4 rounded-full shadow-lg shadow-primary/30 flex justify-center items-center gap-2"
          >
            Continue
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
          <button
            onClick={back}
            className="w-full text-slate-500 hover:text-white font-bold text-sm"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
