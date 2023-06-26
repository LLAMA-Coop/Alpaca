import mongoose from "mongoose";
import connectDB from "../db";
connectDB();

export default mongoose.models.source ||
  mongoose.model(
    "source",
    new mongoose.Schema({
      title: String,
      contributors: [String],
      medium: String,
      url: String,
      lastAccessed: Date,
      dateAdded: {
        type: Date,
        default: Date.now,
      },
    })
  );
