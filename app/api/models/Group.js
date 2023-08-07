import { model, models, Schema } from "mongoose";
import connectDB from "../db";
connectDB();

const GroupSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            minLength: 2,
            maxLength: 100,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        users: [
            {
                type: Schema.Types.ObjectId,
                ref: "user",
            },
        ],
        admins: [
            {
                type: Schema.Types.ObjectId,
                ref: "user",
            },
        ],
    },
    {
        timestamps: true,
    },
);

export default models?.group || model("group", GroupSchema);
