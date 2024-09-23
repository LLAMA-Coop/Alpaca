import { unauthorized } from "@/lib/apiErrorResponses";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";
import {
    canDeleteResource,
    canEditResource,
    catchRouteError,
    updateCourse,
} from "@/lib/db/helpers.js";

// UPDATE COURSE

export async function PATCH(req) {
    const { id } = req.params;
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
    } = await req.json();

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        if (!(await canEditResource(user.id, id, "course"))) {
            return NextResponse.json(
                {
                    message: "You do not have permission to edit this course",
                },
                { status: 404 },
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
                { status: 400 },
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

export async function DELETE(req, { params }) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const { id } = params;

        if (!(await canDeleteResource(user.id, id, "course"))) {
            return NextResponse.json(
                {
                    message: "You do not have permission to delete this course",
                },
                { status: 404 },
            );
        }

        await db.deleteFrom("courses").where("id", "=", id).execute();

        return NextResponse.json(
            {
                message: "Successfully deleted course",
            },
            { status: 200 },
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
