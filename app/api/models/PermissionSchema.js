import { Schema } from "mongoose";

const PermissionSchema = new Schema({
    group: {
        type: Schema.Types.ObjectId,
        ref: "group",
    },
    permssions: {
        type: Number,
        min: 0,
        max: 63,
    },
});

export default PermissionSchema;
