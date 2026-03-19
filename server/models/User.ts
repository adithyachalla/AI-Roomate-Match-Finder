import { Document, model, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;

  username: string;
  fullname: string;

  otpHash?: string | null;
  otpSalt?: string | null;
  otpExpiresAt?: Date | null;
  otpAttempts?: number;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    passwordHash: {
      type: String,
      required: true
    },

    username: {
      type: String,
      required: true
    },

    fullname: {
      type: String,
      required: true
    },

    otpHash: { type: String, default: null },
    otpSalt: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    otpAttempts: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default model<IUser>("User", UserSchema);