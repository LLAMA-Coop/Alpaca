import { model, models, Schema } from "mongoose";
import connectDB from "../db";
connectDB();

const QuizSchema = new Schema(
  {
    type: {
      type: String,
      default: "prompt-response",
      enum: {
        values: [
          "prompt-response",
          "multiple-choice",
          "fill-in-the-blank",
          "ordered-list-answer",
          "unordered-list-answer",
          "verbatim",
        ],
        message: "Invalid quiz type",
      },
    },
    prompt: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 100,
    },
    choices: [
      {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 16,
      },
    ],
    correctResponses: [
      {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 16,
      },
    ],
    sources: [
      {
        type: Schema.Types.ObjectId,
        ref: "source",
      },
    ],
    notes: [
      {
        type: Schema.Types.ObjectId,
        ref: "note",
      },
    ],
    contributors: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
  },
);

export default models?.quiz || model("quiz", QuizSchema);
