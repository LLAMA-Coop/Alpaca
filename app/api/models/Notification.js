import { model, models, Schema } from "mongoose";

const NotificationSchema = new Schema(
    {
        type: {
            type: Number,
            enum: [0, 1, 2, 3, 4, 5, 6, 7],
            required: true,
        },
        recipient: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        group: {
            type: Schema.Types.ObjectId,
            ref: "group",
        },
        subject: {
            type: String,
            required: true,
            minLength: 2,
            maxLength: 32,
        },
        message: {
            type: String,
            required: true,
            minLength: 2,
            maxLength: 256,
        },
        responseActions: [
            {
                type: String,
                enum: [
                    "Accept",
                    "Decline",
                    "Request",
                    "Join",
                    "Invite",
                    "Ignore",
                    "Send Message",
                    "Reply",
                ],
                required: true,
            },
        ],
        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

NotificationSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

NotificationSchema.set("toJSON", {
    virtuals: true,
});

export default models?.notification ||
    model("notification", NotificationSchema);
