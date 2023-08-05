import { NextResponse } from "next/server";
import Quiz from "@models/Quiz";

export async function GET(req) {
    return NextResponse.json({
        message: "You have successfully received a response from /api/quiz",
    });
}

export async function POST(req) {
    const { type, prompt, choices, correctResponses, sources, notes } =
        await req.json();

    const allowedType = ["prompt-response", "multiple-choice"];

    if (!allowedType.includes(type)) {
        return NextResponse.json({
            400: {
                message: "Invalid type submitted",
            },
        });
    }

    if (!prompt) {
        return NextResponse.json({
            400: {
                message: "Prompt is required",
            },
        });
    }

    if (!correctResponses) {
        return NextResponse.json({
            400: {
                message: "Correct responses are required",
            },
        });
    }

    if (type === "multiple-choice" && !choices?.length) {
        return NextResponse.json({
            400: {
                message: "Choices are required for multiple choice questions",
            },
        });
    }

    if (notes?.length === 0 && sources?.length === 0) {
        return NextResponse.json({
            400: {
                message: "Need at least one note or source",
            },
        });
    }

    // Need to add validation
    // probably to Quiz model itself

    const quizRcvd = {
        type: type,
        prompt: prompt,
        choices: choices,
        correctResponses: correctResponses,
        authors: ["64b841f6f8bfa3dc4d7079e4"],
        createdBy: "64b841f6f8bfa3dc4d7079e4",
        notes: notes ?? [],
        sources: sources ?? [],
    };

    const quiz = new Quiz(quizRcvd);
    const content = await quiz.save();
    return NextResponse.json({ content }, { status: 201 });
}
