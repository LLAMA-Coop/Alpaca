import MAX from "@/lib/max";
import PermissionSchema from "./PermissionSchema";
import { model, models, Schema } from "mongoose";

const CategorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            minLength: 1,
            maxLength: MAX.title,
        },
        subcategoryOf: [
            {
                type: Schema.Types.ObjectId,
                ref: "category",
            },
        ],
        prerequisites: [
            {
                category: {
                    type: Schema.Types.ObjectId,
                    ref: "category",
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
            ref: "user"
        }
    },
    {
        timestamps: true,
    },
);

CategorySchema.set("toJSON", {
    virtuals: true,
});

export default models?.category || model("category", CategorySchema);
