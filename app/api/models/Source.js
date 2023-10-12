import PermissionSchema from "./PermissionSchema";
import { model, models, Schema } from "mongoose";
import MAX from "@/lib/max";

//  validation:
//  need either lastAccessed or publishDate
//  url to match http format

const SourceSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            minLength: 1,
            maxLength: MAX.title,
        },
        authors: [
            {
                type: String,
                required: true,
                minLength: 1,
                maxLength: MAX.name,
            },
        ],
        medium: {
            type: String,
            enum: {
                values: ["book", "article", "video", "podcast", "website"],
                message: "Invalid medium",
            },
        },
        url: {
            type: String,
        },
        tags: [
            {
                type: String,
                minLength: 1,
                maxLength: MAX.tag,
            },
        ],
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        publishedAt: {
            type: Date,
        },
        lastAccessed: {
            type: Date,
        },
        permissions: PermissionSchema,
    },
    {
        timestamps: true,
    },
);

SourceSchema.set("toJSON", {
    virtuals: true,
});

export default models?.source || model("source", SourceSchema);
