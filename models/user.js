/**
 * user model schema
 */

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      index: { unique: true, dropDups: true },
      required: "Name is required",
    },
    role: {
      type: String,
      default: "user",
      enum: ["superadmin", "admin", "user"],
    },
    phone: {
      type: String,
      required: "phone is required",
    },
    password: {
      type: String,
      required: "Password is required",
      index: { unique: true, dropDups: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", userSchema);
