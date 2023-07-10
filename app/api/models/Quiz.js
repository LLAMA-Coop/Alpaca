import { model, models, Schema } from "mongoose";
import connectDB from "../db";
connectDB();

export default models.quiz ||
  model(
    "quiz",
    new Schema({
      prompt: String,
      correctResponses: [String],
      sources: [{ type: Schema.Types.ObjectId, ref: "source" }],
      notes: [{ type: Schema.Types.ObjectId, ref: "note" }],
      contributors: [
        {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
      ],
    })
  );
