import { Schema } from "mongoose";

const PermissionSchema = new Schema({
    group: {
        type: Schema.Types.ObjectId,
        ref: "group",
    },
    canRead: Boolean,
    canWrite: Boolean,
});

export default PermissionSchema;
