import Quiz from "../models/Quiz";
import { NextResponse } from "next/server";

export async function GET(req) {
  return NextResponse.json(
    {
      message: "You have successfully received a response from /api/quiz",
    }
  );
}

export async function POST(req) {
  const body = await req.json();

  const addedBy = "64b841f6f8bfa3dc4d7079e4";
  if (!addedBy) {
    return NextResponse.json(
      {
        400: {
          message:
            "User information was not submitted. This may be because the user is not signed in.",
        },
      }
    );
  }

  // Need to add validation
  // probably to Quiz model itself

  let quizRcvd = {
    prompt: body.prompt,
    correctResponses: [...body.correctResponses],
    contributors: [addedBy],
    addedBy,
  };
  if (body.notes && body.notes.length > 0) {
    quizRcvd.notes = [...body.notes];
  }
  if (body.sources && body.sources.length > 0) {
    quizRcvd.sources = [...body.sources];
  }

  const quiz = new Quiz(quizRcvd);
  let content = await quiz.save();
  return NextResponse.json({ 200: { content } });
}
