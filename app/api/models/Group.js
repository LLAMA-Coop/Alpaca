import PermissionSchema from "./PermissionSchema";
import { model, models, Schema } from "mongoose";
import connectDB from "../db";
connectDB();

const GroupSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            minLength: 1,
            maxLength: 100,
        },
        description: {
            type: String,
            minLength: 2,
            maxLength: 512,
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
        permissions: {
            type: PermissionSchema,
            default: {
                allRead: false,
                allWrite: false,
                usersRead: [],
                usersWrite: [],
                groupsRead: [],
                groupsWrite: [],
            },
        },
        isPublic: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

export default models?.group || model("group", GroupSchema);
