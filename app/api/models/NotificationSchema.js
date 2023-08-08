import { Schema } from "mongoose";
import User from "./User";

// validator needs to use the group listed for that admin
async function verifyAdmin(value) {
    const user = await User.findById(value);
    if (!user) return false;
    return user.roles.includes("admin")
}

const NotificationSchema = new Schema({
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
        required: true,
    },
    subject: {
        type: String,
        required: true,
        enum: {
            values: [
                "Response required: Notice of violation",
                "A group has invited you to join them!"
            ]
        }
    },
    message: {
        type: String,
    }
});

export default NotificationSchema;
