import { model, models, Schema } from "mongoose";
import connectDB from "../db";
connectDB();

// This is for tracking progress on quiz questions
// and spaced repetition (Leitner method)
const userQuiz = new Schema({});

export default models.user ||
  model(
    "user",
    new Schema({
      username: { type: String, required: true },
      passwordHash: { type: String, required: true },
      dateAdded: {
        type: Date,
        default: Date.now,
      },
      roles: {
        type: [String],
        default: ["user"],
      },
      quizzes: [userQuiz],
    })
  );
