import { NextResponse } from "next/server";
import { useUser } from "@/lib/auth";
import Quiz from "@models/Quiz";

const allowedType = ["prompt-response", "multiple-choice"];

export async function GET(req) {
    return NextResponse.json({
        message: "You have successfully received a response from /api/quiz",
    });
}

export async function POST(req) {
    const user = await useUser();

    if (!user) {
        return NextResponse.json(
            {
                message: "Unauthorized",
            },
            { status: 401 },
        );
    }

    const { type, prompt, choices, correctResponses, sources, notes } =
        await req.json();

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

    const quizRcvd = {
        type: type,
        prompt: prompt,
        choices: choices,
        correctResponses: correctResponses,
        contributors: [user._id],
        createdBy: user._id,
        notes: notes ?? [],
        sources: sources ?? [],
    };

    const quiz = new Quiz(quizRcvd);
    const content = await quiz.save();
    return NextResponse.json({ content }, { status: 201 });
}

export async function PUT(req) {
    const user = await useUser();
    if (!user) {
        return NextResponse.json({
            403: {
                message: "Login required",
            },
        });
    }

    const {
        _id,
        type,
        prompt,
        choices,
        correctResponses,
        hints,
        sources,
        notes,
        permissions,
    } = await req.json();

    const quiz = await Quiz.findById(_id);
    if (!quiz) {
        return NextResponse.json({
            404: {
                message: `No quiz found with id ${_id}`,
            },
        });
    }

    // Need to add groups permissions to canEdit
    const canEdit =
        quiz.createdBy === _id ||
        quiz.permissions == undefined ||
        quiz.permissions.allWrite ||
        quiz.permissions.usersWrite.includes(_id);
    if (!canEdit) {
        return NextResponse.json({
            403: {
                message: `You are not permitted to edit quiz ${_id}`,
            },
        });
    }

    if (type && !allowedType.includes(type)) {
        return NextResponse.json({
            400: {
                message: "Invalid type submitted",
            },
        });
    }

    if (type) {
        quiz.type = type;
    }
    if (prompt) {
        quiz.prompt = prompt;
    }
    if (choices) {
        quiz.choices = [...choices];
    }
    if (correctResponses) {
        quiz.correctResponses = [...correctResponses];
    }
    if (hints) {
        quiz.hints = [...hints];
    }

    if (sources) {
        sources.forEach((source) => {
            if (!quiz.sources.include(source)) {
                quiz.sources.push(source);
            }
        });
    }
    if (notes) {
        notes.forEach((note) => {
            if (!quiz.notes.include(note)) {
                quiz.notes.push(note);
            }
        });
    }

    if (permissions) {
        // this might cause errors b/c doesn't use ObjectId
        quiz.permissions = JSON.parse(JSON.stringify(permissions));
    }

    if (!quiz.contributors.include(user._id)) {
        quiz.contributors.push(user._id);
    }
    quiz.updatedBy = user._id;

    const content = await quiz.save();
    return NextResponse.json({ 200: content });
}
