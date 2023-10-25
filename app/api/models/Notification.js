import { model, models, Schema } from "mongoose";

const NotificationSchema = new Schema(
    {
        recipient: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        senderUser: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        senderGroup: {
            type: Schema.Types.ObjectId,
            ref: "group",
        },
        subject: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        responseActions: [
            {
                type: String,
                enum: [
                    "accept association",
                    "request association",
                    "join group",
                    "invite to group",
                    "ignore",
                    "delete notification",
                    "send message",
                    "reply",
                ],
                required: true,
            },
        ],
    },
    {
        timestamps: true,
    },
);

export default models?.notification ||
    model("notification", NotificationSchema);
