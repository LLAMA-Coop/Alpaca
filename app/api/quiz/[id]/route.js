import whichIndexesIncorrect from "@/lib/whichIndexesIncorrect";
import { isValidDate, timestampFromDate } from "@/lib/date";
import { unauthorized } from "@/lib/apiErrorResponses";
import { stringCompare } from "@/lib/stringCompare";
import { areFieldsEqual } from "@/lib/objects";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";
import {
    getResourcePermissions,
    canDeleteResource,
    canEditResource,
    catchRouteError,
    updateQuiz,
} from "@/lib/db/helpers";

// UPDATE QUIZ

export async function PATCH(req, { params }) {
    const { id } = req;

    const data = await req.json();
    const { type, prompt, choices, answers, hints, sources, notes, courses, tags, permissions } =
        data;

    if (!Object.keys(data).length) {
        return NextResponse.json(
            {
                message: "No data provided to update",
            },
            { status: 400 }
        );
    }

    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value });
        if (!user) return unauthorized;

        if (!(await canEditResource(user.id, id, "quizzes", "quiz"))) {
            return NextResponse.json(
                {
                    message: "You do not have permission to edit this quiz",
                },
                { status: 400 }
            );
        }

        const quiz = await db
            .selectFrom("quizzes")
            .select(({ eb }) => ["id", "createdBy", getResourcePermissions("quiz", id, eb)])
            .where("id", "=", id)
            .executeTakeFirst();

        if (!quiz) {
            return NextResponse.json(
                {
                    message: "Quiz not found",
                },
                { status: 404 }
            );
        }

        if (!areFieldsEqual(permissions, quiz.permissions) && quiz.createdBy !== user.id) {
            return NextResponse.json(
                {
                    message: "You do not have permission to edit permissions for this quiz",
                },
                { status: 403 }
            );
        }

        const content = await updateQuiz({
            id,
            type,
            prompt,
            choices,
            answers,
            hints,
            sources,
            notes,
            courses,
            tags,
            permissions,
            contributorId: user.id,
        });

        if (!content.valid) {
            return NextResponse.json(
                {
                    message: "Invalid quiz data",
                    errors: content.errors,
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            message: "Successfully updated quiz",
            content,
        });
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}

// GRADE QUIZ

export async function POST(req, props) {
    const params = await props.params;
    const { answers } = await req.json();
    const { id } = params;

    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value });
        if (!user) return unauthorized;

        const quiz = await db
            .selectFrom("quizzes")
            .selectAll()
            .where("id", "=", id)
            .executeTakeFirst();

        if (!quiz) {
            return NextResponse.json(
                {
                    message: "Quiz not found",
                },
                { status: 404 }
            );
        }

        let isCorrect;
        let incorrectIndexes;

        if (quiz.type === "true-false") {
            // True-false quizzes are always correct if the answer is the same
            isCorrect = quiz.answers[0] === answers;
        }

        if (quiz.type === "prompt-response") {
            isCorrect = stringCompare(quiz.answers[0], answers) >= 0.8;
        }

        if (quiz.type === "multiple-choice") {
            isCorrect =
                quiz.answers.every((a) => answers.includes(a)) &&
                answers.length === quiz.answers.length;
        }

        if (
            [
                "ordered-list-answer",
                "unordered-list-answer",
                "fill-in-the-blank",
                "verbatim",
            ].includes(quiz.type)
        ) {
            incorrectIndexes = whichIndexesIncorrect(
                answers,
                quiz.answers,
                quiz.type !== "unordered-list-answer"
            );

            isCorrect = incorrectIndexes.length === 0;
        }

        let quizInteraction = await db
            .selectFrom("user_quizzes")
            .select(["level", "triesAtLevel", "lastCorrect", "hiddenUntil"])
            .where("userId", "=", user.id)
            .where("quizId", "=", quiz.id)
            .executeTakeFirst();

        let hasUserInteractedWithQuiz = !!quizInteraction;
        let currentLevel = quizInteraction?.level || 0;
        let canProgressLevel = false;

        if (!quizInteraction) {
            canProgressLevel = true;

            quizInteraction = {
                level: 0,
                quizId: quiz.id,
                triesAtLevel: 0,
                hiddenUntil: new Date(),
            };
        } else {
            canProgressLevel =
                !isValidDate(quizInteraction.hiddenUntil) ||
                new Date(quizInteraction.hiddenUntil) < new Date();
        }

        if (isCorrect && canProgressLevel) {
            let hiddenUntil = new Date();

            quizInteraction.lastCorrect = new Date();
            quizInteraction.level += 1;

            quizInteraction.hiddenUntil = new Date(
                hiddenUntil.setHours(hiddenUntil.getHours() + quizInteraction.level)
            );
        } else if (isCorrect) {
            quizInteraction.lastCorrect = new Date();
        } else {
            quizInteraction.lastCorrect = 0;
            quizInteraction.level = quizInteraction.level > 0 ? quizInteraction.level - 1 : 0;
        }

        const lastCorrect = timestampFromDate(quizInteraction.lastCorrect);
        const hiddenUntil = timestampFromDate(quizInteraction.hiddenUntil);
        const hasLeveledUp = currentLevel < quizInteraction.level;
        const level = quizInteraction.level;

        if (hasUserInteractedWithQuiz) {
            await db
                .updateTable("user_quizzes")
                .set((eb) => ({
                    level,
                    triesAtLevel: hasLeveledUp ? 0 : eb("triesAtLevel", "+", 1),
                    lastCorrect,
                    hiddenUntil,
                }))
                .where("quizId", "=", quiz.id)
                .execute();
        } else {
            await db
                .insertInto("user_quizzes")
                .values({
                    userId: user.id,
                    quizId: quiz.id,
                    level,
                    lastCorrect,
                    hiddenUntil,
                })
                .execute();
        }

        const sendHints = shouldSendHints(level, quizInteraction.triesAtLevel || 0);

        return NextResponse.json(
            {
                message: "Quiz successfully graded",
                content: {
                    isCorrect,
                    incorrectIndexes,
                    hints: sendHints ? hintsFromLevel(quiz.hints, level) : [],
                },
            },
            { status: 200 }
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}

function hintsFromLevel(hints, level) {
    if (!hints) return [];
    if (hints.length === 0) return [];

    // We want at least one hint to be sent

    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    const newHints = hints.slice(0, level + 1);

    if (newHints.length === 0) return [randomHint];
    return newHints;
}

function shouldSendHints(level, tries) {
    // The more the level, the more tries needed to send hints
    // Minimum tries to send hints is 3

    return tries >= Math.max(3, level * 2);
}

// DELETE QUIZ

export async function DELETE(req, props) {
    const params = await props.params;
    const { id } = params;

    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value });
        if (!user) return unauthorized;

        if (!(await canDeleteResource(user.id, id, "quiz"))) {
            return NextResponse.json(
                {
                    message: "You do not have permission to delete this quiz",
                },
                { status: 404 }
            );
        }

        await db.deleteFrom("quizzes").where("id", "=", id).execute();

        return NextResponse.json(
            {
                message: "Successfully deleted quiz",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
