const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5001";

/** Remove client auth fields (JWT, user snapshot, role, OTP draft keys). */
export function clearClientAuthState() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  localStorage.removeItem("pendingEmail");
  localStorage.removeItem("signupEmail");
  localStorage.removeItem("isNewUser");
}

/**
 * End server session cookie and clear local auth. Safe to call even if offline.
 */
export async function logoutRequest() {
  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // still clear local session
  }
  clearClientAuthState();
}

/**
 * Persist student vs owner in the database and mirror to localStorage.role + user snapshot.
 */
export async function persistAccountRole(accountRole) {
  const u = JSON.parse(localStorage.getItem("user") || "{}");
  if (!u._id) {
    throw new Error("Not logged in");
  }
  const res = await fetch(`${API_BASE}/api/user/${u._id}/account-role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accountRole })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Failed to save account role");
  }
  localStorage.setItem("role", accountRole);
  if (data.user) {
    localStorage.setItem(
      "user",
      JSON.stringify({
        ...u,
        ...data.user,
        _id: data.user._id || u._id
      })
    );
  }
  return data;
}
