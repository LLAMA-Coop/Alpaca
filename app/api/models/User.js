import { model, models, Schema } from "mongoose";

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
            maxLength: 32,
        },
        displayName: {
            type: String,
            required: true,
            minLength: 2,
            maxLength: 32,
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
                ref: "user"
            }
        ],
        groups: [
            {
                type: Schema.Types.ObjectId,
                ref: "group",
            },
        ],
        quizzes: [TQuiz],
        lastLogin: {
            type: Date,
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

UserSchema.set("toJSON", {
    virtuals: true,
});

export default models?.user || model("user", UserSchema);
