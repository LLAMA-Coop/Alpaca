import { NextResponse } from "next/server";
import { useUser } from "@/lib/auth";
// import { Quiz } from "@mneme_app/database-models";
import { Quiz } from "@/app/api/models";
import { server, unauthorized } from "@/lib/apiErrorResponses";

// this will be used to check answers on server
// THEN put result in User's quizzes list
export async function POST(req) {
    try {
        const user = await useUser();

        if (!user) {
            return unauthorized;
        }

        const _id = req.nextUrl.pathname.split("/")[3];

        const quiz = await Quiz.findById(_id);
        if (!quiz) {
            return NextResponse.json(
                {
                    message: `The quiz ${_id} could not be found to delete`,
                },
                { status: 404 },
            );
        }

        const { userResponse } = await req.json();
        console.log(userResponse);

        const isCorrect = quiz.correctResponses.find(
            (x) => x.toLowerCase() === userResponse.toLowerCase(),
        );
        console.log("Route, is correct?", isCorrect)

        return NextResponse.json({
            message: { isCorrect: isCorrect != undefined },
        });
    } catch (error) {
        console.error(`[Quiz] POST error:\n ${error}`);
        return server;
    }
}

export async function DELETE(req) {
    try {
        const user = await useUser();

        if (!user) {
            return unauthorized;
        }

        const _id = req.nextUrl.pathname.split("/")[3];

        const quiz = await Quiz.findById(_id);
        if (!quiz) {
            return NextResponse.json(
                {
                    message: `The quiz ${_id} could not be found to delete`,
                },
                { status: 404 },
            );
        }

        if (quiz.createdBy.toString() !== user._id.toString()) {
            return NextResponse.json(
                {
                    message: `User ${user._id} is not authorized to delete quiz ${_id}. Only the creator ${quiz.createdBy} is permitted`,
                },
                { status: 403 },
            );
        }

        const deletion = await Quiz.deleteOne({ _id });
        console.log(deletion);
        if (deletion.deletedCount === 0) {
            console.error(`Unable to delete quiz ${_id}\nError: ${error}`);
            return NextResponse.json(
                {
                    message: `Unable to delete quiz ${_id}`,
                },
                { status: 500 },
            );
        }
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error(`[Quiz] DELETE error:\n ${error}`);
        return server;
    }
}
