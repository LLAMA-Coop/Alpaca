import { model, models, Schema } from "mongoose";
import MAX from "@/lib/max";
// import NotificationSchema from "./NotificationSchema";

// This is for tracking progress on quiz questions
// and spaced repetition (Leitner method)

const TQuiz = new Schema({
    quizId: {
        type: Schema.Types.ObjectId,
        ref: "quiz",
        required: true,
    },
    lastCorrect: {
        type: Date,
    },
    level: {
        type: Number,
        default: 0,
    },
    hiddenUntil: {
        type: Date,
    },
});

const UserSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            minLength: 2,
            maxLength: MAX.username,
        },
        displayName: {
            type: String,
            minLength: 2,
            maxLength: MAX.username,
        },
        avatar: {
            type: String,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        refreshTokens: {
            type: [String],
            default: [],
        },
        associates: [
            {
                type: Schema.Types.ObjectId,
                ref: "user",
            },
        ],
        groups: [
            {
                type: Schema.Types.ObjectId,
                ref: "group",
            },
        ],
        quizzes: [TQuiz],
        notifications: [Object],
        lastLogin: {
            type: Date,
        },
        isPublic: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);

UserSchema.set("toJSON", {
    virtuals: true,
});

export default models?.user || model("user", UserSchema);
