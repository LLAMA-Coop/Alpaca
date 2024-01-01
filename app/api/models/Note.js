import SourceReferenceSchema from "./SourceReferenceSchema";
import PermissionSchema from "./PermissionSchema";
import { model, models, Schema } from "mongoose";
import { MIN, MAX } from "@/lib/constants";

// Should add option to link to videos/images instead of text
// Captions will be required in those cases

const NoteSchema = new Schema(
    {
        title: {
            type: String,
            required: false,
            minLength: MIN.noteTitle,
            maxLength: MAX.noteTitle,
        },
        text: {
            type: String,
            required: true,
            minLength: MIN.noteText,
            maxLength: MAX.noteText,
        },
        tags: [
            {
                type: String,
                minLength: MIN.tag,
                maxLength: MAX.tag,
            },
        ],
        courses: [
            {
                type: Schema.Types.ObjectId,
                ref: "course",
            },
        ],
        sources: [
            {
                type: Schema.Types.ObjectId,
                ref: "source",
            },
        ],
        sourceReferences: [
            {
                type: SourceReferenceSchema,
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
        permissions: PermissionSchema,
    },
    {
        timestamps: true,
    },
);

NoteSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

NoteSchema.set("toJSON", {
    virtuals: true,
});

export default models?.note || model("note", NoteSchema);
