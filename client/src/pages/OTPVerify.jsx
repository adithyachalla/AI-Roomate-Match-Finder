// src/pages/OTPVerify.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5001";

export default function OTPVerify() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const e = localStorage.getItem("pendingEmail");
    if (!e) {
      navigate("/login");
      return;
    }
    setEmail(e);
  }, [navigate]);

  useEffect(() => {
    let t;
    if (cooldown > 0) {
      t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleVerify = async (ev) => {
    ev?.preventDefault?.();
    setError("");

    if (!otp || otp.trim().length === 0) {
      setError("Please enter the verification code.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          otp: otp.trim()
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) setError("Invalid code. Please try again.");
        else if (res.status === 429) setError("Too many attempts. Request a new code.");
        else setError(data.message || "Verification failed. Try again.");
        return;
      }

      // ✅ SAVE TOKEN
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // ✅ SAVE USER DATA (CRITICAL FIX)
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
      } else {
        console.error("User data missing from backend response");
      }

      // cleanup
      localStorage.removeItem("pendingEmail");

      const isNewUser = localStorage.getItem("isNewUser");
      const role = localStorage.getItem("role");

      if (isNewUser === "true") {
        navigate("/onboarding");
      } else {
        if (role === "owner") {
          navigate("/owner-dashboard");
        } else {
          navigate("/student-dashboard");
        }
      }

    } catch (err) {
      console.error("verify otp error", err);
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim()
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Failed to resend code");
        return;
      }

      setCooldown(30);
    } catch (err) {
      console.error("resend otp error", err);
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background-light dark:bg-background-dark">
      <div className="w-full max-w-md bg-card-dark p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Enter verification code</h2>
        <p className="text-sm text-slate-400 mb-4">
          We sent a 6-digit code to <span className="font-medium">{email}</span>.
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit code"
            className="w-full p-3 rounded-lg text-black"
            inputMode="numeric"
            pattern="\d{6}"
          />

          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-primary text-white rounded-lg font-semibold disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || loading}
              className="px-4 py-3 bg-white/5 rounded-lg font-semibold disabled:opacity-60"
            >
              {cooldown > 0 ? `Resend (${cooldown}s)` : "Resend"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("pendingEmail");
              navigate("/login");
            }}
            className="w-full mt-3 text-sm text-slate-400"
          >
            ← Back to login
          </button>
        </form>
      </div>
    </div>
  );
}