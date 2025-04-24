import { unauthorized } from "@/lib/apiErrorResponses";
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
    updateCourse,
} from "@/lib/db/helpers.js";

// UPDATE COURSE

export async function PATCH(req, props) {
    const params = await props.params;
    const { id } = params;

    const data = await req.json();
    const {
        name,
        description,
        enrollment,
        parents,
        prerequisites,
        sources,
        notes,
        quizzes,
        addAllFromSources,
        addAllFromNotes,
        permissions,
    } = data;

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

        if (!(await canEditResource(user.id, id, "courses", "course"))) {
            return NextResponse.json(
                {
                    message: "You do not have permission to edit this course",
                },
                { status: 400 }
            );
        }

        const course = await db
            .selectFrom("courses")
            .select(({ eb }) => ["id", "createdBy", getResourcePermissions("course", id, eb)])
            .where("id", "=", id)
            .executeTakeFirst();

        if (!course) {
            return NextResponse.json(
                {
                    message: "Course not found",
                },
                { status: 404 }
            );
        }

        if (!areFieldsEqual(permissions, course.permissions) && course.createdBy !== user.id) {
            return NextResponse.json(
                {
                    message: "You do not have permission to edit permissions for this note",
                },
                { status: 403 }
            );
        }

        const content = await updateCourse({
            id,
            name,
            description,
            enrollment,
            parents,
            prerequisites,
            sources,
            notes,
            quizzes,
            addAllFromSources,
            addAllFromNotes,
            permissions,
            contributorId: user.id,
        });

        if (!content.valid) {
            return NextResponse.json(
                {
                    message: "Invalid course data",
                    errors: content.errors,
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            message: "Successfully updated course",
            content,
        });
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}

// DELETE COURSE

export async function DELETE(req, props) {
    const params = await props.params;
    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value });
        if (!user) return unauthorized;

        const { id } = params;

        if (!(await canDeleteResource(user.id, id, "course"))) {
            return NextResponse.json(
                {
                    message: "You do not have permission to delete this course",
                },
                { status: 404 }
            );
        }

        await db.deleteFrom("courses").where("id", "=", id).execute();

        return NextResponse.json(
            {
                message: "Successfully deleted course",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
