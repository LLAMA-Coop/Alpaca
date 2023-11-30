import MAX from "@/lib/max";
import PermissionSchema from "./PermissionSchema";
import { model, models, Schema } from "mongoose";

const CourseSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            minLength: 1,
            maxLength: MAX.title,
        },
        description: {
            type: String,
            required: true,
            minLength: 1,
            maxLength: MAX.description,
        },
        parentCourses: [
            {
                type: Schema.Types.ObjectId,
                ref: "course",
            },
        ],
        prerequisites: [
            {
                course: {
                    type: Schema.Types.ObjectId,
                    ref: "course",
                },
                requiredAverageLevel: {
                    type: Number,
                    default: 1,
                },
            },
        ],
        permissions: PermissionSchema,
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
    },
    {
        timestamps: true,
    },
);

CourseSchema.set("toJSON", {
    virtuals: true,
});

export default models?.course || model("course", CourseSchema);
