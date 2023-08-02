import { model, models, Schema } from "mongoose";
import connectDB from "../db";
connectDB();

export default models?.quiz ||
  model(
    "quiz",
    new Schema({
      type: {
        type: String,
        default: "prompt-response",
      },
      prompt: String,
      choices: [String],
      correctResponses: [String],
      sources: [{ type: Schema.Types.ObjectId, ref: "source" }],
      notes: [{ type: Schema.Types.ObjectId, ref: "note" }],
      contributors: [
        {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
      ],
      dateAdded: {
        type: Date,
        default: Date.now,
      },
      addedBy: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    }),
  );
