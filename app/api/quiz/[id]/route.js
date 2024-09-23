import whichIndexesIncorrect from "@/lib/whichIndexesIncorrect";
import { unauthorized } from "@/lib/apiErrorResponses";
import stringCompare from "@/lib/stringCompare";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { htmlDate } from "@/lib/date";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";
import {
    canDeleteResource,
    catchRouteError,
    canEditResource,
    updateQuiz,
} from "@/lib/db/helpers";

// UPDATE QUIZ

export async function PATCH(req) {
    const { id } = req.params;
    const {
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
    } = await req.json();

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        if (!(await canEditResource(user.id, id, "quiz"))) {
            return NextResponse.json(
                {
                    message: "You do not have permission to edit this quiz",
                },
                { status: 404 },
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
                { status: 400 },
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

export async function POST(req, { params }) {
    const { answer } = await req.json();
    const { id } = params;

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
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
                { status: 404 },
            );
        }

        let isCorrect;
        let incorrectIndexes;

        if (["prompt-response", "multiple-choice"].includes(quiz.type)) {
            isCorrect =
                quiz.answers.find((x) => {
                    return stringCompare(x, answer) >= 0.8;
                }) !== undefined;
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
                answer,
                quiz.answers,
                quiz.type !== "unordered-list-answer",
            );

            isCorrect = incorrectIndexes.length === 0;
        }

        let quizInteraction = await db
            .selectFrom("user_quizzes")
            .select("level")
            .where("userId", "=", user.id)
            .where("quizId", "=", quiz.id)
            .executeTakeFirst();

        let hasUserInteractedWithQuiz = !!quizInteraction;

        let canProgressLevel = false;

        if (!quizInteraction) {
            canProgressLevel = true;

            quizInteraction = {
                quizId: quiz.id,
                level: 0,
                hiddenUntil: new Date(),
            };
        } else {
            canProgressLevel =
                Date.now() > quizInteraction.hiddenUntil.getTime();
        }

        if (isCorrect && canProgressLevel) {
            let hiddenUntil = new Date();
            quizInteraction.lastCorrect = new Date();
            quizInteraction.level += 1;

            quizInteraction.hiddenUntil = hiddenUntil.setDate(
                hiddenUntil.getDate() + quizInteraction.level,
            );
        } else if (isCorrect) {
            quizInteraction.lastCorrect = new Date();
        } else {
            quizInteraction.lastCorrect = 0;
            quizInteraction.level =
                quizInteraction.level > 0 ? quizInteraction.level - 1 : 0;
        }

        const lastCorrect =
            htmlDate(quizInteraction.lastCorrect) === "Not yet"
                ? 0
                : htmlDate(quizInteraction.lastCorrect);
        const hiddenUntil =
            htmlDate(quizInteraction.hiddenUntil) === "Not yet"
                ? 0
                : htmlDate(quizInteraction.hiddenUntil);
        const level = quizInteraction.level;

        // Update the user's quiz interaction if it exists already
        // Otherwise, create a one
        if (hasUserInteractedWithQuiz) {
            await db
                .update("user_quizzes")
                .set({
                    lastCorrect,
                    level,
                    hiddenUntil,
                })
                .where("quizId", "=", quiz.id)
                .execute();
        } else {
            await db
                .insertInto("user_quizzes")
                .values({
                    userId: user.id,
                    quizId: quiz.id,
                    lastCorrect,
                    level,
                    hiddenUntil,
                })
                .execute();
        }

        return NextResponse.json(
            {
                message: "Quiz successfully graded",
                content: {
                    isCorrect,
                    incorrectIndexes,
                    quiz: {
                        ...quiz,
                        ...quizInteraction,
                    },
                },
            },
            { status: 200 },
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}

// DELETE QUIZ

export async function DELETE(req, { params }) {
    const { id } = params;

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        if (!(await canDeleteResource(user.id, id, "quiz"))) {
            return NextResponse.json(
                {
                    message: "You do not have permission to delete this quiz",
                },
                { status: 404 },
            );
        }

        await db.deleteFrom("quizzes").where("id", "=", id).execute();

        return NextResponse.json(
            {
                message: "Successfully deleted quiz",
            },
            { status: 200 },
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
