import { model, models, Schema } from "mongoose";
import connectDB from "../db";
connectDB();

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

const ERole = {
    values: ["user", "guest", "admin"],
    message: "Invalid role",
};

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
        roles: {
            type: [
                {
                    type: String,
                    enum: ERole,
                },
            ],
            default: ["user"],
        },
        quizzes: [TQuiz],
        lastLogin: {
            type: Date,
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
