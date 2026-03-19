import { useState } from "react";
import Role from "./Role";
import LifestylePreferences from "./LifestylePreferences";
import LivingPreferences from "./LivingPreferences";
import ProfileCustomization from "./ProfileCustomization";

export default function Onboarding() {
  const [step, setStep] = useState(1);

  const [profileData, setProfileData] = useState({
    role: "student",
    lifestyle: {},
    livingPreferences: {},
    bio: "",
    profilePic: ""
  });

  const next = () => setStep(prev => Math.min(prev + 1, 4));
  const back = () => setStep(prev => Math.max(prev - 1, 1));

  // ✅ FINAL SUBMIT FUNCTION
  const handleFinalSubmit = async (finalData) => {
    try {
      const existing = JSON.parse(localStorage.getItem("user")) || {};

      if (!existing._id) {
        alert("User ID missing. Please login again.");
        return;
      }

      const finalProfile = {
        ...profileData,
        ...finalData
      };

      console.log("FINAL PROFILE:", finalProfile);

      const res = await fetch("http://localhost:5001/api/profile/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: existing._id,
          profileData: {
            ...finalProfile,
            username: existing.username,
            fullname: existing.fullname
          }
        })
      });

      const data = await res.json();
      console.log("API RESPONSE:", data);

      if (!res.ok) {
        alert("Profile creation failed");
        return;
      }

      // ✅ SAVE LOCALLY
      localStorage.setItem("user", JSON.stringify({
        ...existing,
        ...finalProfile
      }));

      // ✅ REDIRECT
      window.location.href = "/student-dashboard";

    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-background-dark text-white flex flex-col">

      {/* Progress */}
      <div className="flex justify-center py-6">
        <div className="flex gap-2">
          {[1,2,3,4].map(n => (
            <div
              key={n}
              className={`h-2 w-12 rounded-full ${
                step >= n ? "bg-primary" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="flex-1">

        {step === 1 && (
          <Role
            next={next}
            setData={(data) =>
              setProfileData(prev => ({ ...prev, role: data.role }))
            }
          />
        )}

        {step === 2 && (
          <LivingPreferences
            next={next}
            setData={(data) =>
              setProfileData(prev => ({
                ...prev,
                livingPreferences: data
              }))
            }
          />
        )}

        {step === 3 && (
          <LifestylePreferences
            next={next}
            setData={(data) =>
              setProfileData(prev => ({
                ...prev,
                lifestyle: data
              }))
            }
          />
        )}

        {step === 4 && (
          <ProfileCustomization
            next={handleFinalSubmit}
          />
        )}

      </div>

      {/* Nav */}
      <div className="flex justify-between px-8 py-6 border-t border-white/10">
        <button onClick={back} disabled={step === 1}>
          ← Previous
        </button>
        <span>Step {step} of 4</span>
      </div>
    </div>
  );
}