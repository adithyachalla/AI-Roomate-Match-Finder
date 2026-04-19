// server/routes/auth.ts
import { Router } from "express";
import { login, verifyOtp, signup, resendOtp, transporter, authMe, logout } from "../controllers/authController.js";

const router = Router();

router.get("/me", authMe);
router.post("/logout", logout);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/signup", signup);
router.post("/resend-otp", resendOtp);

// Optional: a quick test endpoint you can call to verify SMTP without triggering signup/login flows.
router.post("/test-email", async (req, res) => {
  try {
    const to = req.body?.to || process.env.SMTP_USER;
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER || "no-reply@roomsync.local",
      to,
      subject: "RoomSync test email",
      text: "This is a test email from RoomSync — if you see this, SMTP is working."
    };
    if (!transporter) {
      return res.status(500).json({ ok: false, message: "No SMTP configured (transporter null). Check .env" });
    }
    const info = await transporter.sendMail(mailOptions);
    console.log("Test email sent:", info.messageId || info.response);
    return res.json({ ok: true, info });
  } catch (err) {
    console.error("test-email error:", err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

export default router;