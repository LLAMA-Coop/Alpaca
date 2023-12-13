import { Schema } from "mongoose";

const SourceReferenceSchema = new Schema({
    source: {
        type: Schema.Types.ObjectId,
        ref: "source",
    },
    location: {
        type: String,
    },
    locationType: {
        type: String,
        default: "page",
        enum: {
            values: ["page", "id reference", "section", "timestamp"],
            message: "Invalid location identifier for a source reference",
        },
    },
});

export default SourceReferenceSchema;
