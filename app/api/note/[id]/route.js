import { unauthorized } from "@/lib/apiErrorResponses";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";
import {
    canDeleteResource,
    canEditResource,
    catchRouteError,
    updateNote,
} from "@/lib/db/helpers.js";

// UPDATE NOTE

export async function PATCH(req) {
    const { id } = req.params;
    const { title, text, sources, courses, tags, permissions } =
        await req.json();

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        if (!(await canEditResource(user.id, id, "note"))) {
            return NextResponse.json(
                {
                    message: "You do not have permission to edit this note",
                },
                { status: 404 },
            );
        }

        const content = await updateNote({
            id,
            title,
            text,
            sources,
            courses,
            tags,
            permissions,
            contributorId: user.id,
        });

        if (!content.valid) {
            return NextResponse.json(
                {
                    message: "Invalid note data",
                    errors: content.errors,
                },
                { status: 400 },
            );
        }

        return NextResponse.json({
            message: "Successfully updated source",
            content,
        });
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}

// DELETE NOTE

export async function DELETE(req, { params }) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const { id } = params;

        if (!(await canDeleteResource(user.id, id, "note"))) {
            return NextResponse.json(
                {
                    message: "You do not have permission to delete this note",
                },
                { status: 404 },
            );
        }

        await db.deleteFrom("notes").where("id", "=", id).execute();

        return NextResponse.json(
            {
                message: "Successfully deleted note",
            },
            { status: 200 },
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
