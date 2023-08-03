import { model, models, Schema } from "mongoose";
import connectDB from "../db";
connectDB();

// Should add option to link to videos/images instead of text
// Captions will be required in those cases

// Don't forget to validate at least one source ID

const NoteSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 256,
    },
    sources: [
      {
        type: Schema.Types.ObjectId,
        ref: "source",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default models?.note || model("note", NoteSchema);
