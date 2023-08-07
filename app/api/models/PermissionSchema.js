import { Schema } from "mongoose";

const PermissionSchema = new Schema({
    group: {
        type: Schema.Types.ObjectId,
        ref: "group",
    },
    permssions: [
        {
            type: String,
            default: "owner read/write",
            enum: {
                values: [
                    "owner read/write",
                    "group read",
                    "group read/write",
                    "everyone read",
                    "everyone read/write",
                ],
            },
        },
    ],
});

export default PermissionSchema;
