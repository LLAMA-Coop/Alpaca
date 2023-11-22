import { Schema } from "mongoose";

const SourceRefSchema = new Schema({
    source: {
        type: Schema.Types.ObjectId,
        ref: "source",
        required: true,
    },
    locationIdentifier: {
        type: String,
    },
});

export default SourceRefSchema;