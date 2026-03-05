import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10", 10);
const OTP_TTL_MINUTES = parseInt(process.env.OTP_TTL_MINUTES || "10", 10);
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || "3", 10);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined
});

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashWithSalt(value: string, salt: string) {
  return crypto.createHmac("sha256", salt).update(value).digest("hex");
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    if (!email.toLowerCase().endsWith("@usc.edu")) {
      return res.status(403).json({ message: "Must use an @usc.edu email" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });


    const otp = generateOtp();
    const salt = crypto.randomBytes(8).toString("hex");
    const otpHash = hashWithSalt(otp, salt);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    user.otpHash = otpHash;
    user.otpSalt = salt;
    user.otpExpiresAt = expiresAt;
    user.otpAttempts = 0;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_FROM || "no-reply@roomsync.local",
      to: user.email,
      subject: "Your RoomSync verification code",
      text: `Your verification code is ${otp}. It expires in ${OTP_TTL_MINUTES} minutes.`
    };

    try {
      if (process.env.SMTP_HOST) {
        await transporter.sendMail(mailOptions);
      } else {

        console.log(`DEV OTP for ${user.email}: ${otp}`);
      }
    } catch (mailErr) {

      user.otpHash = null;
      user.otpSalt = null;
      user.otpExpiresAt = null;
      user.otpAttempts = 0;
      await user.save();
      console.error("Failed to send OTP email:", mailErr);
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    return res.json({ message: "otp_sent" });
  } catch (err) {
    console.error("login error", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.otpHash || !user.otpSalt || !user.otpExpiresAt) {
      return res.status(400).json({ message: "No OTP pending for this account" });
    }

    if (user.otpExpiresAt < new Date()) {
      user.otpHash = null;
      user.otpSalt = null;
      user.otpExpiresAt = null;
      user.otpAttempts = 0;
      await user.save();
      return res.status(400).json({ message: "OTP expired" });
    }

    if ((user.otpAttempts || 0) >= OTP_MAX_ATTEMPTS) {
      user.otpHash = null;
      user.otpSalt = null;
      user.otpExpiresAt = null;
      user.otpAttempts = 0;
      await user.save();
      return res.status(429).json({ message: "Too many attempts. Request a new code." });
    }

    const attemptHash = hashWithSalt(otp, user.otpSalt!);
    if (attemptHash !== user.otpHash) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      return res.status(401).json({ message: "Invalid OTP" });
    }


    user.otpHash = null;
    user.otpSalt = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    await user.save();

    const token = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: "6h" });
    return res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("verifyOtp error", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function seedDummyUsers() {
  try {
    const usersToEnsure = [
      { email: "alice@usc.edu", password: "Password123" },
      { email: "bob@usc.edu", password: "SecurePass456" }
    ];

    for (const u of usersToEnsure) {
      const exists = await User.findOne({ email: u.email.toLowerCase() });
      if (!exists) {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hash = await bcrypt.hash(u.password, salt);
        await User.create({ email: u.email.toLowerCase(), passwordHash: hash });
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