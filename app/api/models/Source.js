import { model, models, Schema } from "mongoose";
import connectDB from "../db";
connectDB();

export default models.source ||
  model(
    "source",
    new Schema({
      title: String,
      contributors: [String],
      medium: String,
      url: String,
      lastAccessed: Date,
      publishingDate: Date,
      dateAdded: {
        type: Date,
        default: Date.now,
      },
    })
  );
