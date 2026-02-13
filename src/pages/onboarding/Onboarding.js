import { useState } from "react";
import StudentVerification from "./StudentVerification";
import Role from "./Role";
import AccountCreation from "./AccountCreation";
import LifestylePreferences from "./LifestylePreferences";
import LivingPreferences from "./LivingPreferences";
import ProfileCustomization from "./ProfileCustomization";
import MatchDiscovery from "./MatchDiscovery";

export default function Onboarding() {
  const [step, setStep] = useState(1);

  const next = () => setStep(prev => Math.min(prev + 1, 7));
  const back = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-background-dark text-white flex flex-col">

      {/* Progress Bar */}
      <div className="flex justify-center py-6">
        <div className="flex gap-2">
          {[1,2,3,4,5,6].map(n => (
            <div
              key={n}
              className={`h-2 w-12 rounded-full transition-all ${
                step >= n ? "bg-primary" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      {/* SCREENS */}
      <div className="flex-1">
        {step === 1 && <StudentVerification next={next} />}
        {step === 2 && <AccountCreation next={next} back={back} />}
        {step === 3 && <Role next={next} back={back} />}
        {step === 4 && <LivingPreferences next={next} back={back} />}
        {step === 5 && <LifestylePreferences next={next} back={back} />}
        {step === 6 && <ProfileCustomization next={next} back={back} />}
      </div>

      {/* GLOBAL NAV */}
      <div className="flex justify-between items-center px-8 py-6 border-t border-white/10 bg-background-dark/80 backdrop-blur">
        
        <button
          onClick={back}
          disabled={step === 1}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            step === 1
              ? "bg-white/5 text-slate-600 cursor-not-allowed"
              : "bg-white/10 hover:bg-white/20"
          }`}
        >
          ← Previous
        </button>

        <span className="text-sm font-bold text-slate-400">
          Step {step} of 6
        </span>

        <button
          onClick={next}
          disabled={step === 6}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            step === 6
              ? "bg-white/5 text-slate-600 cursor-not-allowed"
              : "bg-primary hover:bg-primary/90"
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
