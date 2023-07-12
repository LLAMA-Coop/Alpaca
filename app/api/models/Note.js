import { model, models, Schema } from "mongoose";
import connectDB from "../db";
connectDB();

// Should add option to link to videos/images instead of text
// Captions will be required in those cases

// Don't forget to validate at least one source ID

export default models.note ||
  model(
    "note",
    new Schema({
      author: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
      },
      text: {
        type: String,
        required: true
      },
      sources: [
        {
          type: Schema.Types.ObjectId,
          ref: "source",
        },
      ],
      dateAdded: {
        type: Date,
        default: Date.now
      }
    })
  );
