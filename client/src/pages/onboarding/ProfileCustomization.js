import { useState } from "react";

export default function ProfileCustomization({ next }) {
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState("");

  const handleFinish = () => {
    // ✅ PASS DATA DIRECTLY (NO STATE TIMING ISSUE)
    next({
      bio,
      profilePic
    });
  };

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center px-4 py-8">

      <div className="max-w-[580px] w-full bg-card-dark rounded-[2rem] p-8 shadow-2xl">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Personalize your profile
        </h1>

        {/* IMAGE PREVIEW */}
        <img
          src={profilePic || "/default-avatar.png"}
          alt="profile"
          className="w-24 h-24 rounded-full mx-auto mb-4"
        />

        {/* FILE UPLOAD */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onloadend = () => {
              setProfilePic(reader.result);
            };
            reader.readAsDataURL(file);
          }}
          className="mb-4 w-full"
        />

        {/* BIO */}
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="About you..."
          className="w-full p-3 text-black rounded mb-4"
        />

        <button
          onClick={handleFinish}
          className="w-full bg-primary py-3 rounded font-bold"
        >
          Complete Setup →
        </button>
      </div>
    </div>
  );
}