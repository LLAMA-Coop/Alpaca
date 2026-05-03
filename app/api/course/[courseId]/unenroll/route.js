import { canUnenrollFromCourse, catchRouteError } from "@/lib/db/helpers";
import { unauthorized } from "@/lib/apiErrorResponses";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";

// UNENROLL FROM COURSE

export async function POST(req, props) {
    const params = await props.params;
    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value });
        if (!user) return unauthorized;

        const { courseId } = params;

        if (!(await canUnenrollFromCourse(user.courseId, courseId))) {
            return NextResponse.json(
                {
                    message: "You are not allowed to unenroll from this course",
                },
                { status: 403 },
            );
        }

        await db
            .deleteFrom("course_users")
            .where({
                courseId: courseId,
                userId: user.courseId,
            })
            .execute();

        return NextResponse.json(
            {
                message: "Successfully unenrolled from this course",
            },
            { status: 200 },
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
