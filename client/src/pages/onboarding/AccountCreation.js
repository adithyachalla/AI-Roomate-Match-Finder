// src/pages/AccountCreation.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5001";

export default function AccountCreation() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    fullname: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // If user came from Login where we set signupEmail, prefill it
    const saved = localStorage.getItem("signupEmail");
    if (saved) {
      setForm((s) => ({ ...s, email: saved }));
    }
  }, []);

  const isValidUscEmail = (value) =>
    typeof value === "string" && value.toLowerCase().trim().endsWith("@usc.edu");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (ev) => {
    ev?.preventDefault?.();
    setError("");

    const emailTrim = String(form.email || "").toLowerCase().trim();

    if (!emailTrim) {
      setError("Please enter your USC email.");
      return;
    }
    if (!isValidUscEmail(emailTrim)) {
      setError("Email must be a valid @usc.edu address.");
      return;
    }

    if (!form.fullname.trim() || !form.username.trim() || !form.password) {
      setError("Please complete all fields.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: emailTrim,
        fullname: form.fullname.trim(),
        username: form.username.trim(),
        password: form.password,
      };

      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // show backend message if present
        setError(data.message || "Signup failed. Try again.");
        return;
      }

      // Success -> OTP sent
      if (data.message === "otp_sent") {
        // clear signupEmail (we used it to prefill) and store pendingEmail for OTP verify
        localStorage.removeItem("signupEmail");
        localStorage.setItem("pendingEmail", payload.email);
        navigate("/otp-verify");
        return;
      }

      // If server returns token directly (unlikely), store token
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.removeItem("signupEmail");
        navigate("/onboarding");
        return;
      }

      // fallback
      navigate("/onboarding");
    } catch (err) {
      console.error("signup error", err);
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-card-dark border border-white/10 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-black mb-2">Complete your profile</h1>
        <p className="text-slate-400 mb-6">Just a few more details to find your match.</p>

        <form onSubmit={handleCreate} className="space-y-4">
          {/* EMAIL (prefilled if available, editable) */}
          <div>
            <label className="text-xs text-slate-400 uppercase">University Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@usc.edu"
              className="w-full p-3 rounded-lg mt-1 text-black"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase">Full Name</label>
            <input
              name="fullname"
              value={form.fullname}
              onChange={handleChange}
              placeholder="First Last"
              className="w-full p-3 rounded-lg mt-1 text-black"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase">Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="choose a username"
              className="w-full p-3 rounded-lg mt-1 text-black"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase">Create Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              className="w-full p-3 rounded-lg mt-1 text-black"
              required
            />
          </div>

          {error && <div className="text-sm text-red-400 text-center">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-white font-bold"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full mt-2 text-sm text-slate-400"
          >
            ← Back to login
          </button>
        </form>
      </div>
    </div>
  );
}