import { NextResponse } from "next/server";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import Course from "../../models/Course";
import { unauthorized, server } from "@/lib/apiErrorResponses";

export async function DELETE(req, { params }) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });

        if (!user) {
            return unauthorized;
        }

        const { _id } = params;

        const course = await Course.findById(_id);
        if (!course) {
            return NextResponse.json(
                {
                    message: `Course with id ${_id} could not be found`,
                },
                { status: 404 },
            );
        }

        if (course.createdBy.toString() !== user._id.toString()) {
            return NextResponse.json(
                {
                    message: `User ${user._id} is not authorized to delete course ${_id}. Only the creator ${course.createdBy} is permitted`,
                },
                { status: 403 },
            );
        }

        const deletion = await Course.deleteOne({ _id });
        if (deletion.deletedCount === 0) {
            console.error(`Unable to delete course with id ${_id}`);
            return NextResponse.json(
                { message: `Unable to delete course ${_id}` },
                { status: 500 },
            );
        }
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error(`[Course] DELETE error:\n ${error}`);
        return server;
    }
}
