import { model, models, Schema } from "mongoose";

const BallotSchema = new Schema({
    voter: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    motion: {
        type: String,
        required: true,
    },
    firstChoice: {
        type: String,
        required: true,
    },
    secondChoice: {
        type: String,
    },
    thirdChoice: {
        type: String,
    },
    isAnonymous: {
        type: Boolean,
    },
    voteAgainst: {
        type: String,
    },
    amendment: {
        type: String,
    },
    deadline: {
        type: Date,
    },
});

export default models?.ballot || model("ballot", BallotSchema);
