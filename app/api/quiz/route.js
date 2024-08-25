import { NextResponse } from "next/server";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { server, unauthorized } from "@/lib/apiErrorResponses";
import { MAX } from "@/lib/constants";
import SubmitErrors from "@/lib/SubmitErrors";
import { db } from "@/lib/db/db.js";
import {
    getPermittedQuizzes,
    insertPermissions,
    updateQuiz,
    addError,
} from "@/lib/db/helpers";

const allowedType = [
    "prompt-response",
    "multiple-choice",
    "unordered-list-answer",
    "ordered-list-answer",
    "fill-in-the-blank",
    "verbatim",
];

export async function GET(req) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const content = await getPermittedQuizzes(user.id);
        return NextResponse.json({
            content,
        });
    } catch (error) {
        console.error(`[Quiz] GET error: ${error}`);
        addError(error, "/api/quiz: GET");
        return server;
    }
}

export async function POST(req) {
    const quizInsertQuery = `INSERT INTO \`Quizzes\` (\`type\`, \`prompt\`, \`choices\`, \`correctResponses\`, \`hints\`, \`tags\`, \`createdBy\`) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const {
            type,
            prompt,
            choices,
            correctResponses,
            hints,
            sources,
            notes,
            courses,
            tags,
            permissions,
        } = await req.json();

        const submitErrors = new SubmitErrors();

        if (!allowedType.includes(type)) {
            submitErrors.addError(`The following type is not valid:\n ${type}`);
        }

        if (!prompt) {
            submitErrors("Missing prompt");
        } else if (prompt.length > MAX.prompt) {
            submitErrors.addError(
                `The following prompt is longer than the maximum permitted, which is ${MAX.prompt} characters:\n ${prompt}`,
            );
        }

        if (!correctResponses?.length) {
            submitErrors("Correct responses are required");
        } else {
            correctResponses.forEach((response) => {
                if (response.length > MAX.response) {
                    if (
                        typeof response !== "string" &&
                        Array.isArray(response)
                    ) {
                        submitErrors.addError(
                            `The following correct response is not valid:\n ${response.toString()}`,
                        );
                        return;
                    }
                    if (response.length > MAX.response) {
                        submitErrors(
                            `The following correct response is longer than the maximum permitted, which is ${MAX.response} characters: \n ${response}`,
                        );
                    }
                }
            });
        }

        if (type === "multiple-choice" && !choices?.length) {
            submitErrors("Choices are required for multiple choice questions");
        } else if (choices?.length) {
            choices.forEach((choice) => {
                if (typeof choice !== "string") {
                    submitErrors.addError(
                        `The following choice is not valid:\n ${choice.toString()}`,
                    );
                    return;
                }
                if (choice.length > MAX.response) {
                    submitErrors(
                        `The following choice is longer than the maximum permitted, which is ${MAX.response} characters: \n ${choice}`,
                    );
                }
            });
        }

        if (notes?.length === 0 && sources?.length === 0) {
            submitErrors("Need at least one note or source");
        }

        tags.forEach((tag) => {
            if (typeof tag !== "string") {
                submitErrors.addError(
                    `The following tag is not valid:\n ${tag.toString()}`,
                );
                return;
            }
            if (tag.length > MAX.tag) {
                submitErrors.addError(
                    `The following tag is longer than the maximum permitted, which is ${MAX.tag} characters: \n ${tag}`,
                );
            }
        });

        if (hints)
            hints.forEach((hint) => {
                if (typeof hint !== "string") {
                    submitErrors.addError(
                        `The following tag is not valid:\n ${tag.toString()}`,
                    );
                    return;
                }
                if (hint.length > MAX.response) {
                    submitErrors.addError(
                        `The following hint is longer than the maximum permitted, which is ${MAX.response} characters: \n ${hint}`,
                    );
                }
            });

        if (submitErrors.cannotSend) {
            return NextResponse.json(
                { message: submitErrors.displayErrors() },
                { status: 400 },
            );
        }

        const fieldsArray = [
            type,
            prompt,
            JSON.stringify(choices),
            JSON.stringify(correctResponses),
            JSON.stringify(hints),
            JSON.stringify(tags),
            user.id,
        ];

        const [quizInsert, fields] = await db
            .promise()
            .query(quizInsertQuery, fieldsArray);

        const quizId = quizInsert.insertId;

        const quizSourceQuery = `INSERT INTO \`ResourceSources\` (resourceId, resourceType, sourceId, locInSource, locType) VALUES ?`;

        const quizSourceValues = sources.map((s) => [
            quizId,
            "quiz",
            s,
            "0",
            "page",
        ]);

        const [quizSourceInserts, fieldsQS] = await db
            .promise()
            .query(quizSourceQuery, [quizSourceValues]);

        const permInsert = await insertPermissions(
            permissions,
            quizId,
            user.id,
        );

        const content = quizInsert;

        return NextResponse.json(
            { message: "Quiz created successfully", content },
            { status: 201 },
        );
    } catch (error) {
        console.error(`[Quiz] POST error: ${error}`);
        addError(error, "/api/quiz: POST");
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
            id,
            type,
            prompt,
            choices,
            correctResponses,
            hints,
            sources,
            notes,
            courses,
            tags,
            permissions,
        } = await req.json();

        const quiz = (await getPermittedQuizzes(user.id)).find(
            (x) => x.id === id,
        );

        if (!quiz) {
            return NextResponse.json(
                {
                    message: `No quiz found with id ${id}`,
                },
                { status: 404 },
            );
        }

        const isCreator =
            (quiz.createdBy && quiz.createdBy === user.id) ||
            (quiz.creator && quiz.creator.id === user.id);
        const canEdit = isCreator || quiz.permissionType === "write";

        if (!canEdit) {
            return NextResponse.json(
                {
                    message: `You are not permitted to edit quiz ${id}`,
                },
                { status: 403 },
            );
        }

        const content = await updateQuiz({
            id,
            type,
            prompt,
            choices,
            correctResponses,
            hints,
            sources,
            notes,
            courses,
            tags,
            permissions: isCreator ? permissions : [],
            contributorId: user.id,
        });

        return NextResponse.json({ content });
    } catch (error) {
        console.error(`[Quiz] PUT error: ${error}`);
        addError(error, "/api/quiz: PUT");
        return server;
    }
}
