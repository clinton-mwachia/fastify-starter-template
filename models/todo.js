/**
 * todo model schema
 */

const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: "user is required",
    },
    title: {
      type: String,
      required: "title is required",
    },
    priority: {
      type: String,
      default: "low",
      enum: ["urgent", "low", "medium"],
    },
    due: {
      type: String,
      default: new Date().toLocaleString(),
      required: "sue date is required",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("todos", todoSchema);
