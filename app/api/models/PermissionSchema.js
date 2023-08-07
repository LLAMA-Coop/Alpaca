import { Schema } from "mongoose";

export default PermissionSchema = new Schema({
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
