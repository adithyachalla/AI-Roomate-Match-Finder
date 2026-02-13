import { useNavigate } from "react-router-dom";

export default function ProfileCustomization() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center px-4 py-8">

      {/* Card */}
      <div className="max-w-[580px] w-full bg-card-dark border border-border-dark rounded-[2rem] p-8 md:p-10 shadow-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
            Personalize your profile
          </h1>
          <p className="text-slate-400 text-sm">
            Complete your setup to start discovering compatible roommates.
          </p>
        </div>

        {/* Profile Photo */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="relative group cursor-pointer">
            <div className="size-28 rounded-full bg-input-dark border-2 border-dashed border-border-dark flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-500 text-4xl">
                add_a_photo
              </span>
            </div>
            <div className="absolute bottom-0 right-0 size-9 bg-primary text-white rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">add</span>
            </div>
          </div>
          <p className="text-sm font-bold">Add profile photo</p>
        </div>

        {/* About Me (FIXED VISIBILITY) */}
        <div className="mb-8">
          <label className="text-xs font-bold uppercase text-slate-400 ml-1">
            About Me
          </label>
          
         <textarea
          className="w-full h-28 mt-2 rounded-2xl border border-border-dark 
             bg-[#0f1722] text-slate-100 placeholder:text-slate-500 
             p-4 focus:ring-2 focus:ring-primary outline-none resize-none"
            placeholder="Describe your daily routine, academic goals..."
          />

        </div>

        {/* Living Habits */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { label: "Cleanliness", value: "Very High", icon: "clean_hands" },
            { label: "Schedule", value: "Night Owl", icon: "nights_stay" },
            { label: "Guests", value: "Rarely", icon: "group" },
            { label: "Pets", value: "Pet Friendly", icon: "pets" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl border border-border-dark bg-input-dark/50"
            >
              <span className="material-symbols-outlined text-primary">
                {item.icon}
              </span>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black">
                  {item.label}
                </p>
                <p className="text-xs font-bold text-slate-200">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={() => navigate("/onboarding/discovery")}
          className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl hover:brightness-110 transition-all"
        >
          Continue to Profile →
        </button>
      </div>
    </div>
  );
}
