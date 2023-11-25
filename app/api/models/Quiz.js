import { model, models, Schema } from "mongoose";
import PermissionSchema from "./PermissionSchema";
import MAX from "@/lib/max";

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
            minLength: 1,
            maxLength: MAX.prompt,
        },
        choices: [
            {
                type: String,
                required: true,
                minLength: 1,
                maxLength: MAX.response,
            },
        ],
        correctResponses: [
            {
                type: Schema.Types.Mixed,
                required: true,
                minLength: 1,
                maxLength: MAX.response,
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
                minLength: 1,
                maxLength: MAX.response,
            },
        ],
        tags: [
            {
                type: String,
                minLength: 1,
                maxLength: MAX.tag,
            },
        ],
        courses: [
            {
                type: Schema.Types.ObjectId,
                ref: "course"
            }
        ],
        sources: [
            {
                type: Schema.Types.ObjectId,
                ref: "source",
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

QuizSchema.set("toJSON", {
    virtuals: true,
});

export default models?.quiz || model("quiz", QuizSchema);
