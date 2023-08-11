import { Schema } from "mongoose";

const PermissionSchema = new Schema({
    allWrite: Boolean,
    allRead: Boolean,
    usersWrite: [
        {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
    ],
    usersRead: [
        {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
    ],
    groupsWrite: [
        {
            type: Schema.Types.ObjectId,
            ref: "group",
        },
    ],
    groupsRead: [
        {
            type: Schema.Types.ObjectId,
            ref: "group",
        },
    ],
});

export default PermissionSchema;
