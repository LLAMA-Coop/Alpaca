import { model, models, Schema } from "mongoose";
import connectDB from "../db";
connectDB();

// validation:
//  need either lastAccessed or publishDate
//  url to match http format
export default models.source ||
  model(
    "source",
    new Schema({
      title: { type: String, required: true },
      contributors: [String],
      medium: { type: String, required: true },
      url: { type: String, required: true },
      lastAccessed: Date,
      publishDate: Date,
      dateAdded: {
        type: Date,
        default: Date.now,
      },
    })
  );
