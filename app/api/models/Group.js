import { MAX, MIN } from "@/lib/constants";
import { model, models, Schema } from "mongoose";

const GroupSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            minLength: MIN.groupName,
            maxLength: MAX.groupName,
        },
        description: {
            type: String,
            minLength: MIN.groupDescription,
            maxLength: MAX.groupDescription,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        admins: [
            {
                type: Schema.Types.ObjectId,
                ref: "user",
            },
        ],
        users: [
            {
                type: Schema.Types.ObjectId,
                ref: "user",
            },
        ],
        isPublic: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

GroupSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

GroupSchema.set("toJSON", {
    virtuals: true,
});

export default models?.group || model("group", GroupSchema);
