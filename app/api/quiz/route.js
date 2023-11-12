import { NextResponse } from "next/server";
// import { Quiz } from "@mneme_app/database-models";
import { Quiz } from "@/app/api/models";
import { useUser, canEdit, queryReadableResources } from "@/lib/auth";
import { cookies } from "next/headers";
import { serializeOne } from "@/lib/db";
import { server, unauthorized } from "@/lib/apiErrorResponses";
import { Types } from "mongoose";

const allowedType = [
    "prompt-response",
    "multiple-choice",
    "unordered-list-answer",
    "ordered-list-answer",
    "fill-in-the-blank",
];

export async function GET(req) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const content = await Quiz.find(queryReadableResources(user));
        return NextResponse.json({
            content,
        });
    } catch (error) {
        console.error(`[Quiz] GET error: ${error}`);
        return server;
    }
}

export async function POST(req) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const {
            type,
            prompt,
            choices,
            correctResponses,
            sources,
            notes,
            permissions,
        } = await req.json();

        console.log("perms in quiz route", permissions);

        if (!allowedType.includes(type)) {
            return NextResponse.json(
                {
                    message: "Invalid type submitted",
                },
                { status: 400 },
            );
        }

        if (!prompt) {
            return NextResponse.json(
                {
                    message: "Prompt is required",
                },
                { status: 400 },
            );
        }

        if (!correctResponses) {
            return NextResponse.json(
                {
                    message: "Correct responses are required",
                },
                { status: 400 },
            );
        }

        if (type === "multiple-choice" && !choices?.length) {
            return NextResponse.json(
                {
                    message:
                        "Choices are required for multiple choice questions",
                },
                { status: 400 },
            );
        }

        if (notes?.length === 0 && sources?.length === 0) {
            return NextResponse.json(
                {
                    message: "Need at least one note or source",
                },
                { status: 400 },
            );
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
            permissions: serializeOne(permissions) ?? {},
        };

        const quiz = new Quiz(quizRcvd);
        const content = await quiz.save();
        return NextResponse.json({ content }, { status: 201 });
    } catch (error) {
        console.error(`[Quiz] POST error: ${error}`);
        return server;
    }
}

export async function PUT(req) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });

        if (!user) {
            return unauthorized;
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
            return NextResponse.json(
                {
                    message: `No quiz found with id ${_id}`,
                },
                { status: 404 },
            );
        }

        if (!canEdit(quiz, user)) {
            return NextResponse.json(
                {
                    message: `You are not permitted to edit quiz ${_id}`,
                },
                { status: 403 },
            );
        }

        if (type && !allowedType.includes(type)) {
            return NextResponse.json(
                {
                    message: "Invalid type submitted",
                },
                { status: 400 },
            );
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
            console.log("In quiz PUT route, adding sources", sources);
            sources.forEach((sourceId_req, index) => {
                console.log(index, sourceId_req);
                if (
                    !quiz.sources.find(
                        (srcId) => srcId.toString() == sourceId_req,
                    )
                ) {
                    quiz.sources.push(new Types.ObjectId(sourceId_req));
                }
            });
        }
        if (notes) {
            notes.forEach((noteId_req) => {
                if (
                    !quiz.notes.find(
                        (noteId) => noteId._id.toString() == noteId_req,
                    )
                ) {
                    quiz.notes.push(new Types.ObjectId(noteId_req));
                }
            });
        }

        if (permissions && quiz.createdBy.toString() === user._id.toString()) {
            quiz.permissions = serializeOne(permissions);
        }

        if (!quiz.contributors.includes(user._id)) {
            quiz.contributors.push(user._id);
        }
        quiz.updatedBy = user._id;

        const content = await quiz.save();
        return NextResponse.json({ content });
    } catch (error) {
        console.error(`[Quiz] PUT error: ${error}`);
        return server;
    }
}
