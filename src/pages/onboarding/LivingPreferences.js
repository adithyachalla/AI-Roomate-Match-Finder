import { useState } from "react";

export default function LivingPreferences({ next, back }) {
  const [budget, setBudget] = useState(1200);
  const [entireUnit, setEntireUnit] = useState(true);
  const [neighborhoods, setNeighborhoods] = useState(["University City", "North Campus"]);
  const [moveIn, setMoveIn] = useState("2024-08-15");

  const toggleNeighborhood = (name) => {
    setNeighborhoods((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name]
    );
  };

  return (
    <div className="bg-background-dark text-slate-100 min-h-screen flex flex-col items-center justify-center px-6 py-12">

      {/* LOGO + BADGE */}
      <div className="mb-10 flex flex-col items-center">
        <div className="flex items-center gap-4 mb-4">

          {/* Diamond Logo */}
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border-[3px] border-white/20 rounded-md rotate-45 -translate-x-1 -translate-y-1"></div>
            <div className="absolute inset-0 border-[3px] border-accent-teal rounded-md rotate-45 translate-x-1 translate-y-1"></div>
          </div>

          <h2 className="text-white text-2xl font-black tracking-tight">
            Room<span className="text-accent-teal">Sync</span>
          </h2>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
          Step 4 of 6: Housing Preferences
        </div>
      </div>

      {/* CARD */}
      <div className="w-full max-w-2xl bg-card-dark border border-white/10 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden">

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent-teal"></div>

        <div className="mb-10 text-center">
          <h1 className="text-2xl lg:text-3xl font-black mb-3">
            Your Housing Preferences
          </h1>
          <p className="text-slate-400 text-sm">
            Help us find the perfect match based on your lifestyle and budget.
          </p>
        </div>

        <div className="space-y-8 mb-10">

          {/* Budget */}
          <div>
            <div className="flex justify-between items-end">
              <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Monthly Budget
              </label>
              <span className="text-2xl font-black text-primary">
                ${budget}
              </span>
            </div>
            <input
              type="range"
              min="400"
              max="3000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full mt-3 accent-primary"
            />
          </div>

          {/* Lease Type */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center">
            <div>
              <h4 className="text-white font-bold mb-1">Lease Type</h4>
              <p className="text-xs text-slate-400">
                Prefer sharing a unit or having your own?
              </p>
            </div>
            <button
              onClick={() => setEntireUnit(!entireUnit)}
              className={`px-4 py-2 rounded-xl font-bold text-xs ${
                entireUnit ? "bg-primary text-white" : "bg-white/10 text-slate-400"
              }`}
            >
              {entireUnit ? "Entire Unit" : "Individual Room"}
            </button>
          </div>

          {/* Neighborhoods */}
          <div>
            <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Preferred Neighborhoods
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              {[
                "University City",
                "North Campus",
                "Downtown",
                "West Village",
                "Southside",
                "Eastside",
              ].map((n) => (
                <button
                  key={n}
                  onClick={() => toggleNeighborhood(n)}
                  className={`p-3 text-xs font-bold rounded-xl border transition-all ${
                    neighborhoods.includes(n)
                      ? "border-primary bg-primary/10 text-white"
                      : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Move-in Date */}
          <div>
            <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Move-in Date
            </label>
            <input
              type="date"
              value={moveIn}
              onChange={(e) => setMoveIn(e.target.value)}
              className="w-full mt-3 bg-white/5 border border-white/10 rounded-2xl h-14 px-4 text-white"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <button
            onClick={next}
            className="w-full h-16 rounded-2xl bg-primary text-white text-lg font-black shadow-xl shadow-primary/25 hover:scale-[1.01] transition-all"
          >
            Continue
          </button>
          <button
            onClick={back}
            className="w-full h-12 text-slate-500 hover:text-slate-300 font-bold text-sm uppercase tracking-widest"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
