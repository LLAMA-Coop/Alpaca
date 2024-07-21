import SourceReferenceSchema from "./SourceReferenceSchema";
import PermissionSchema from "./PermissionSchema";
import { model, models, Schema } from "mongoose";
import { MIN, MAX } from "@/lib/constants";

const QuizSchema = new Schema(
    {
        type: {
            type: String,
            default: "prompt-response",
            enum: {
                values: [
                    "prompt-response",
                    "multiple-choice",
                    "fill-in-the-blank",
                    "ordered-list-answer",
                    "unordered-list-answer",
                    "verbatim",
                ],
                message: "Invalid quiz type",
            },
        },
        prompt: {
            type: String,
            required: true,
            minLength: MIN.quizPrompt,
            maxLength: MAX.quizPrompt,
        },
        choices: [
            {
                type: String,
                required: true,
                minLength: MIN.quizChoice,
                maxLength: MAX.quizChoice,
            },
        ],
        correctResponses: [
            {
                type: Schema.Types.Mixed,
                required: true,
                minLength: MIN.quizResponse,
                maxLength: MAX.quizResponse,
                validate: [
                    {
                        validator: function (value) {
                            if (!Array.isArray(value)) return false;
                            for (const item of value) {
                                if (
                                    !Array.isArray(item) &&
                                    typeof item !== "string"
                                ) {
                                    return false;
                                }
                            }
                            return true;
                        },
                    },
                ],
            },
        ],
        hints: [
            {
                type: String,
                minLength: MIN.quizChoice,
                maxLength: MAX.quizChoice,
            },
        ],
        tags: [
            {
                type: String,
                minLength: MIN.tag,
                maxLength: MAX.tag,
            },
        ],
        courses: [
            {
                type: Schema.Types.ObjectId,
                ref: "course",
            },
        ],
        sources: [
            {
                type: Schema.Types.ObjectId,
                ref: "source",
            },
        ],
        sourceReferences: [
            {
                type: SourceReferenceSchema,
            },
        ],
        notes: [
            {
                type: Schema.Types.ObjectId,
                ref: "note",
            },
        ],
        contributors: [
            {
                type: Schema.Types.ObjectId,
                ref: "user",
            },
        ],
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        permissions: PermissionSchema,
    },
    {
        timestamps: true,
    },
);

QuizSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

QuizSchema.set("toJSON", {
    virtuals: true,
});

export default models?.quiz || model("quiz", QuizSchema);
