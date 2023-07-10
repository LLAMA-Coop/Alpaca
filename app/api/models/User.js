import { model, models, Schema } from "mongoose";
import connectDB from "../db";
connectDB();

const userQuiz = new Schema({

})

export default models.user || model("user", new Schema({
    username: String,
    passwordHash: String,
    quizzes: [userQuiz]
}));
