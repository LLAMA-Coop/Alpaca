import { unauthorized } from "@/lib/apiErrorResponses";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";
import {
    catchRouteError,
    canEnrollInCourse,
    doesUserMeetPrerequisites,
} from "@/lib/db/helpers";

// ENROLL IN COURSE

export async function POST(req, props) {
    const params = await props.params;
    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value });
        if (!user) return unauthorized;

        const { id } = params;

        if (!(await canEnrollInCourse(user.id, id))) {
            return NextResponse.json(
                {
                    message: "You are not allowed to enroll in this course",
                },
                { status: 403 },
            );
        }

        if (!doesUserMeetPrerequisites(user.id, id)) {
            return NextResponse.json(
                {
                    message:
                        "You do not meet the prerequisites for this course",
                },
                { status: 400 },
            );
        }

        await db
            .insertInto("course_users")
            .values({
                courseId: id,
                userId: user.id,
            })
            .execute();

        return NextResponse.json(
            {
                message: "Successfully enrolled in this course",
            },
            { status: 200 },
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
