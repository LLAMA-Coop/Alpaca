import whichIndexesIncorrect from "@/lib/whichIndexesIncorrect";
import { server, unauthorized } from "@/lib/apiErrorResponses";
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
    getQuizzesById,
    getUserQuizzes,
    updateQuiz,
    addError,
} from "@/lib/db/helpers";

export async function PATCH(req) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

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

        if (!(await canEditResource(user.id, id, "quiz"))) {
            return NextResponse.json(
                {
                    message: "You do not have permission to edit this quiz.",
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
                    message: "Invalid quiz data.",
                    errors: content.errors,
                },
                { status: 400 },
            );
        }

        return NextResponse.json({
            message: "Successfully updated quiz.",
            content,
        });
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}

export async function POST(req, { params }) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const { _id } = params;
        const { userResponse } = await req.json();

        const quiz = (await getQuizzesById({ id: _id }))[0];

        if (!quiz) {
            return NextResponse.json(
                {
                    message: `Quiz with id ${_id} could not be found`,
                },
                { status: 404 },
            );
        }

        let isCorrect;
        let incorrectIndexes;

        if (["prompt-response", "multiple-choice"].includes(quiz.type)) {
            let incorrect = quiz.correctResponses.find(
                (x) => stringCompare(x, userResponse) >= 0.8,
            );
            isCorrect = incorrect !== undefined;
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
                userResponse,
                quiz.correctResponses,
                quiz.type !== "unordered-list-answer",
            );
            isCorrect = incorrectIndexes.length === 0;
        }

        let quizInUser = (await getUserQuizzes(user.id)).find(
            (x) => x.quizId === quiz.id,
        );
        console.log("USER QUIZ", quizInUser);
        let canProgressLevel = false;
        if (!quizInUser) {
            canProgressLevel = true;
            quizInUser = {
                quizId: quiz.id,
                level: 0,
                hiddenUntil: new Date(),
            };
        } else {
            canProgressLevel = Date.now() > quizInUser.hiddenUntil.getTime();
        }
        if (isCorrect && canProgressLevel) {
            let hiddenUntil = new Date();
            quizInUser.lastCorrect = new Date();
            quizInUser.level += 1;
            quizInUser.hiddenUntil = hiddenUntil.setDate(
                hiddenUntil.getDate() + quizInUser.level,
            );
        } else if (isCorrect) {
            quizInUser.lastCorrect = new Date();
        } else {
            quizInUser.lastCorrect = 0;
            quizInUser.level = quizInUser.level > 0 ? quizInUser.level - 1 : 0;
        }

        if (quizInUser.id) {
            const [results, fields] = await db
                .promise()
                .query(
                    "UPDATE `UserQuizzes` SET `lastCorrect` = ?, `level` = ?, `hiddenUntil` = ? WHERE `id` = ?",
                    [
                        htmlDate(quizInUser.lastCorrect) === "Not yet"
                            ? 0
                            : htmlDate(quizInUser.lastCorrect),
                        quizInUser.level,
                        htmlDate(quizInUser.hiddenUntil) === "Not yet"
                            ? 0
                            : htmlDate(quizInUser.hiddenUntil),
                        quizInUser.id,
                    ],
                );

            console.log("RESULTS", results);
        } else {
            await db
                .promise()
                .query(
                    "INSERT INTO UserQuizzes (`userId`, `quizId`, `lastCorrect`, `level`, `hiddenUntil`) VALUES (?, ?, ?, ?, ?)",
                    [
                        user.id,
                        quiz.id,
                        htmlDate(quizInUser.lastCorrect) === "Not yet"
                            ? 0
                            : htmlDate(quizInUser.lastCorrect),
                        quizInUser.level,
                        htmlDate(quizInUser.hiddenUntil) === "Not yet"
                            ? 0
                            : htmlDate(quizInUser.hiddenUntil),
                    ],
                );
        }

        return NextResponse.json({
            message: {
                isCorrect,
                incorrectIndexes,
                user,
                quiz: quizInUser,
            },
        });
    } catch (error) {
        console.error(`[Quiz] POST error:\n ${error}`);
        addError(error, "/api/quiz/[_id]: POST");
        return server;
    }
}

export async function DELETE(req, { params }) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const { id } = params;

        if (!(await canDeleteResource(user.id, id, "quiz"))) {
            return NextResponse.json(
                {
                    message: "You do not have permission to delete this quiz.",
                },
                { status: 404 },
            );
        }

        await db.deleteFrom("quizzes").where("id", "=", id).execute();

        return NextResponse.json(
            {
                message: "Successfully deleted quiz.",
            },
            { status: 200 },
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
