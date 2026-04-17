// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5001";

export default function Login() {
  const navigate = useNavigate();

  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ui state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidUscEmail = (value) =>
    typeof value === "string" && value.toLowerCase().trim().endsWith("@usc.edu");

  // Step 1: submit credentials to server to request OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    localStorage.removeItem("isNewUser");
    const emailTrim = email.toLowerCase().trim();
    if (!isValidUscEmail(emailTrim)) {
      setError("Please sign in with an @usc.edu email.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTrim, password })
      });

      const data = await res.json().catch(() => ({}));

      // If backend says account doesn't exist -> go to signup and pass email
      // (Your backend returns 401 + message "Email does not exist" for missing user)
      if (!res.ok && res.status === 401 && data.message && data.message.toLowerCase().includes("email")) {
        // store the email for AccountCreation to read and prefill
        localStorage.setItem("signupEmail", emailTrim);
        navigate("/signup");
        return;
      }

      if (!res.ok) {
        // handle other errors
        if (res.status === 403) setError(data.message || "Please use an @usc.edu email.");
        else if (res.status === 401) setError("Invalid credentials. Please try again.");
        else setError(data.message || "Login failed. Please try again.");
        return;
      }

      // Verified user — backend returned JWT directly (no OTP needed)
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", "student");
        if (data.user) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              _id: data.user._id,
              username: data.user.username,
              fullname: data.user.fullname,
              email: data.user.email
            })
          );
        }
        navigate("/student-dashboard");
        return;
      }

      // Unverified user — OTP sent, navigate to verification page
      if (data.message === "otp_sent") {
        localStorage.setItem("pendingEmail", emailTrim);
        localStorage.setItem("isNewUser", "false");
        localStorage.setItem("role", "student");

        navigate("/otp-verify");
        return;
      }

      // generic fallback
      setError("Unexpected server response. Please try again.");
    } catch (err) {
      console.error("login error", err);
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      {/* LEFT SIDE DESIGN PANEL */}
      <div className="hidden lg:flex relative bg-navy-deep overflow-hidden items-center justify-center p-12">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/30 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent-teal/20 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-lg text-white">
          <div className="flex items-center gap-6 mb-10">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-[5px] border-white/20 rounded-lg rotate-45 -translate-x-2 -translate-y-2"></div>
              <div className="absolute inset-0 border-[5px] border-accent-teal rounded-lg rotate-45 translate-x-2 translate-y-2"></div>
            </div>

            <div className="text-5xl font-light tracking-tighter">
              Room<span className="font-extrabold text-accent-teal">Sync</span>
            </div>
          </div>

          <h2 className="text-4xl font-extrabold leading-tight mb-6">
            Find your perfect match, not just a roommate.
          </h2>

          <p className="text-white/70 text-lg">
            Join thousands of students using AI to discover compatible living partners.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE FORM */}
      <main className="flex flex-col items-center justify-center p-6 md:p-12 lg:p-24">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold mb-2">Welcome Back</h1>
            <p className="text-slate-500 dark:text-slate-400">Sign in to continue</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="University Email (must be @usc.edu)"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-4 px-4 focus:ring-primary focus:border-primary"
              required
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-4 px-4 focus:ring-primary focus:border-primary"
              required
            />

            <button
              type="submit"
              className={`w-full py-4 bg-primary text-white font-extrabold rounded-xl shadow-lg transition-all ${loading ? "opacity-60" : "hover:scale-105"}`}
              disabled={loading}
            >
              {loading ? "Processing..." : "Sign In"}
            </button>
          </form>

          {error && <div className="text-sm text-red-500 text-center">{error}</div>}

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-bold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}