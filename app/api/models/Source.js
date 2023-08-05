import { model, models, Schema } from "mongoose";
import connectDB from "../db";
connectDB();

//  validation:
//  need either lastAccessed or publishDate
//  url to match http format

const SourceSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            minLength: 1,
            maxLength: 100,
        },
        authors: [
            {
                type: String,
                required: true,
                minLength: 1,
                maxLength: 100,
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
        addedBy: {
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
    },
    {
        timestamps: true,
    },
);

SourceSchema.set("toJSON", {
    virtuals: true,
});

export default models?.source || model("source", SourceSchema);
