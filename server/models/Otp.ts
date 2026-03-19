import { Document, model, Schema, Types } from "mongoose";

export interface IOtp extends Document {
  userId: Types.ObjectId;
  otpHash: string;
  otpSalt: string;
  createdAt: Date;
  expiresAt: Date;
  attempts: number;
}

const OtpSchema = new Schema<IOtp>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    otpHash: {
      type: String,
      required: true
    },

    otpSalt: {
      type: String,
      required: true
    },

    createdAt: {
      type: Date,
      default: () => new Date()
    },

    expiresAt: {
      type: Date,
      required: true
    },

    attempts: {
      type: Number,
      default: 0
    }
  },
  {
    collection: "otps"
  }
);

// ✅ TTL index → auto delete expired OTPs
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ✅ OPTIONAL INDEX → faster lookup for latest OTP per user
OtpSchema.index({ userId: 1, createdAt: -1 });

export default model<IOtp>("Otp", OtpSchema);