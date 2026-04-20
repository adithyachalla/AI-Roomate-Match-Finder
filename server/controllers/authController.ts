// server/controllers/authController.ts
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Otp from "../models/Otp.js";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "rs_session";
const JWT_EXPIRES = "6h";
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10", 10);

function authCookieMaxAgeMs() {
  return 6 * 60 * 60 * 1000;
}

/** httpOnly session cookie (same JWT as JSON body; cleared on logout). */
export function attachAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: authCookieMaxAgeMs()
  });
}

function readCookie(req: Request, name: string): string | undefined {
  const raw = req.headers.cookie;
  if (!raw) return undefined;
  const parts = raw.split(";").map((c) => c.trim());
  for (const p of parts) {
    if (p.startsWith(`${name}=`)) {
      return decodeURIComponent(p.slice(name.length + 1));
    }
  }
  return undefined;
}

function getBearerToken(req: Request): string | undefined {
  const h = req.headers.authorization;
  if (h && h.startsWith("Bearer ")) return h.slice(7).trim();
  return undefined;
}

export function getTokenFromRequest(req: Request): string | undefined {
  return readCookie(req, AUTH_COOKIE_NAME) || getBearerToken(req);
}

/**
 * GET /api/auth/me — validate JWT from cookie or Authorization header.
 */
export async function authMe(req: Request, res: Response) {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; email: string };
    const user = await User.findById(payload.sub).select("email accountRole");
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    return res.json({
      userId: payload.sub,
      email: user.email,
      accountRole: user.accountRole || "student"
    });
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

/**
 * POST /api/auth/logout — clear httpOnly session cookie.
 */
export function logout(_req: Request, res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
  return res.json({ ok: true });
}
const OTP_TTL_MINUTES = parseInt(process.env.OTP_TTL_MINUTES || "10", 10);
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || "3", 10);

// Create transporter from env. If SMTP_HOST missing, transporter will be null (dev fallback).
let transporter: nodemailer.Transporter | null = null;
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    } : undefined
  });

  // Verify transporter right away (helpful debug)
  transporter.verify()
    .then(() => {
      console.log("SMTP transporter ready");
    })
    .catch((err) => {
      console.error("SMTP transporter verify failed:", err);
      // keep transporter assigned — sendMail will fail and error will be handled per request
    });
} else {
  console.log("No SMTP_HOST configured — emails will be printed to console (dev fallback).");
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashWithSalt(value: string, salt: string) {
  return crypto.createHmac("sha256", salt).update(value).digest("hex");
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const emailNormalized = String(email).toLowerCase().trim();

    if (!emailNormalized.endsWith("@usc.edu")) {
      return res.status(403).json({ message: "Must use an @usc.edu email" });
    }

    const user = await User.findOne({ email: emailNormalized });
    if (!user) {
      // frontend expects a clear message; you previously wanted "mail does not exist"
      return res.status(404).json({ message: "Email does not exist" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    // If user has already verified their email, skip OTP and return JWT directly
    if (user.isVerified) {
      const token = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
      attachAuthCookie(res, token);
      return res.json({
        message: "Login successful",
        token,
        user: {
          _id: user._id,
          username: user.username,
          fullname: user.fullname,
          email: user.email,
          accountRole: user.accountRole || "student"
        }
      });
    }

    // User not yet verified — send OTP for email verification
    // Remove previous OTPs for this user
    await Otp.deleteMany({ userId: user._id });

    // Generate OTP and store hashed OTP in Otp collection
    const otp = generateOtp();
    const salt = crypto.randomBytes(8).toString("hex");
    const otpHash = hashWithSalt(otp, salt);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await Otp.create({
      userId: user._id,
      otpHash,
      otpSalt: salt,
      expiresAt,
      attempts: 0
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER || "no-reply@roomsync.local",
      to: user.email,
      subject: "Your RoomSync verification code",
      text: `Your verification code is ${otp}. It expires in ${OTP_TTL_MINUTES} minutes.`
    };

    try {
      if (transporter) {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent (login):", info.messageId || info.response);
      } else {
        // dev fallback - print OTP to server logs
        console.log(`DEV OTP for ${user.email}: ${otp}`);
      }
    } catch (mailErr) {
      // on send failure, clean up the OTP record
      await Otp.deleteMany({ userId: user._id });
      console.error("Failed to send OTP email (login):", mailErr);
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    return res.json({ message: "otp_sent" });
  } catch (err) {
    console.error("login error", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * POST /api/auth/verify-otp
 * Body: { email, otp }
 */
export async function verifyOtp(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

    const emailNormalized = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: emailNormalized });
    if (!user) return res.status(400).json({ message: "account_not_found" });

    // get the most recent OTP doc for the user
    const otpDoc = await Otp.findOne({ userId: user._id }).sort({ createdAt: -1 });
    if (!otpDoc) return res.status(400).json({ message: "No OTP pending for this account" });

    if (otpDoc.expiresAt < new Date()) {
      await Otp.deleteMany({ userId: user._id });
      return res.status(400).json({ message: "OTP expired" });
    }

    if ((otpDoc.attempts || 0) >= OTP_MAX_ATTEMPTS) {
      await Otp.deleteMany({ userId: user._id });
      return res.status(429).json({ message: "Too many attempts. Request a new code." });
    }

    const attemptHash = hashWithSalt(String(otp), otpDoc.otpSalt);
    if (attemptHash !== otpDoc.otpHash) {
      otpDoc.attempts = (otpDoc.attempts || 0) + 1;
      await otpDoc.save();
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // success: delete OTP docs, mark user as verified, and return JWT
    await Otp.deleteMany({ userId: user._id });
    await User.findByIdAndUpdate(user._id, { isVerified: true });

    const verifiedUser = await User.findById(user._id);
    if (!verifiedUser) return res.status(500).json({ message: "User missing after verify" });

    const token = jwt.sign({ sub: verifiedUser._id.toString(), email: verifiedUser.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    attachAuthCookie(res, token);
    return res.json({
      message: "Login successful",
      token,
      user: {
        _id: verifiedUser._id,
        username: verifiedUser.username,
        fullname: verifiedUser.fullname,
        email: verifiedUser.email,
        accountRole: verifiedUser.accountRole || "student"
      }
    });
  } catch (err) {
    console.error("verifyOtp error", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * POST /api/auth/signup
 * Body: { email, fullname, username, password }
 */
export async function signup(req: Request, res: Response) {
  try {
    const { email, fullname, username, password } = req.body;
    if (!email || !password || !username) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const emailNormalized = String(email).toLowerCase().trim();
    if (!emailNormalized.endsWith("@usc.edu")) {
      return res.status(403).json({ message: "Must use an @usc.edu email" });
    }

    const existing = await User.findOne({ email: emailNormalized });
    if (existing) {
      return res.status(409).json({ message: "Account already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(password, salt);

    // create user
    const newUser = await User.create({
      email: emailNormalized,
      fullname: fullname || "",
      username: username || "",
      passwordHash
    });

    // Roommate Profile documents are created only when a student finishes onboarding
    // (`POST /api/profile/create`). Owners never get a Browse Roommates profile from signup.

    // Generate OTP and store hashed OTP in Otp collection
    const otp = generateOtp();
    const otpSalt = crypto.randomBytes(8).toString("hex");
    const otpHash = hashWithSalt(otp, otpSalt);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await Otp.create({
      userId: newUser._id,
      otpHash,
      otpSalt,
      expiresAt,
      attempts: 0
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER || "no-reply@roomsync.local",
      to: newUser.email,
      subject: "Welcome to RoomSync — verification code",
      text: `Welcome to RoomSync — your verification code is ${otp}. It expires in ${OTP_TTL_MINUTES} minutes.`
    };

    try {
      if (transporter) {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent (signup):", info.messageId || info.response);
      } else {
        console.log(`DEV OTP for ${newUser.email}: ${otp}`);
      }
    } catch (mailErr) {
      // cleanup: delete otp record and user to keep DB consistent
      await Otp.deleteMany({ userId: newUser._id });
      await User.findByIdAndDelete(newUser._id);
      console.error("Failed to send OTP email during signup:", mailErr);
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    return res.status(200).json({ message: "otp_sent" });
  } catch (err) {
    console.error("signup error", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * POST /api/auth/resend-otp
 * Body: { email }
 *
 * Resend a fresh OTP for an existing user (useful for "resend" button).
 * Rate-limiting not implemented here — add if needed.
 */
export async function resendOtp(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const emailNormalized = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: emailNormalized });
    if (!user) return res.status(404).json({ message: "Email does not exist" });

    // remove existing OTPs
    await Otp.deleteMany({ userId: user._id });

    // create and store new OTP
    const otp = generateOtp();
    const salt = crypto.randomBytes(8).toString("hex");
    const otpHash = hashWithSalt(otp, salt);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await Otp.create({
      userId: user._id,
      otpHash,
      otpSalt: salt,
      expiresAt,
      attempts: 0
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER || "no-reply@roomsync.local",
      to: user.email,
      subject: "Your RoomSync verification code (resend)",
      text: `Your verification code is ${otp}. It expires in ${OTP_TTL_MINUTES} minutes.`
    };

    try {
      if (transporter) {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent (resend):", info.messageId || info.response);
      } else {
        console.log(`DEV OTP for ${user.email}: ${otp}`);
      }
    } catch (mailErr) {
      await Otp.deleteMany({ userId: user._id });
      console.error("Failed to resend OTP email:", mailErr);
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    return res.json({ message: "otp_sent" });
  } catch (err) {
    console.error("resendOtp error", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * Idempotent seed (only creates 2 users if missing)
 */
export async function seedDummyUsers() {
  try {
    const usersToEnsure = [
      { email: "alice@usc.edu", username: "alice_johnson", fullname: "Alice Johnson", password: "Password123" },
      { email: "bob@usc.edu", username: "bob_smith", fullname: "Bob Smith", password: "SecurePass456" }
    ];

    for (const u of usersToEnsure) {
      const exists = await User.findOne({ email: u.email.toLowerCase() });
      if (!exists) {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hash = await bcrypt.hash(u.password, salt);
        await User.create({
          email: u.email.toLowerCase(),
          username: u.username,
          fullname: u.fullname,
          passwordHash: hash,
          isVerified: true,
          accountRole: "student"
        });
        console.log(`Seeded user ${u.email} / ${u.password}`);
      } else {
        console.log(`User ${u.email} exists — skipping seed.`);
      }
    }
    console.log("Seeding done.");
  } catch (err) {
    console.error("Error seeding users", err);
  }
}

// Export transporter for optional test endpoint in server.ts or routes
export { transporter };
export default {
  login,
  verifyOtp,
  signup,
  resendOtp,
  seedDummyUsers,
  authMe,
  logout
};