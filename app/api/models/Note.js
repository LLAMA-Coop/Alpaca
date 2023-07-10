import { model, models, Schema } from "mongoose";
import connectDB from "../db";
connectDB();

export default models.note ||
  model(
    "note",
    new Schema({
      author: {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
      text: String,
      sources: [
        {
          type: Schema.Types.ObjectId,
          ref: "source",
        },
      ],
    })
  );
