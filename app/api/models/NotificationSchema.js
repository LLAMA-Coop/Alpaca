import { Schema, Types } from "mongoose";
import User from "./User";

// validator needs to use the group listed for that admin
async function verifyAdmin(value) {
    const user = await User.findById(value);
    if (!user) return false;
    return user.roles.includes("admin");
}

const NotificationSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        default: Types.ObjectId,
    },
    from: {
        group: {
            type: Schema.Types.ObjectId,
            ref: "group",
        },
        admin: {
            type: Schema.Types.ObjectId,
            ref: "user",
            validate: {
                validator: verifyAdmin,
                message:
                    "You must be an administrator to send a message to an individual user",
            },
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        required: true,
    },
    subject: {
        type: String,
    },
    message: {
        type: String,
    },
    responseActions: [
        {
            type: String,
            enum: ["acceptAssociation", "join", "ignore", "delete", "reply"],
        },
    ],
});

export default NotificationSchema;
