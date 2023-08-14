import { Schema } from "mongoose";

const PermissionSchema = new Schema({
    allRead: Boolean,
    allWrite: Boolean,
    usersRead: [
        {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
    ],
    usersWrite: [
        {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
    ],
    groupsRead: [
        {
            type: Schema.Types.ObjectId,
            ref: "group",
        },
    ],
    groupsWrite: [
        {
            type: Schema.Types.ObjectId,
            ref: "group",
        },
    ],
});

export default PermissionSchema;
