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
    updateNote,
} from "@/lib/db/helpers.js";

// UPDATE NOTE

export async function PATCH(req, props) {
    const params = await props.params;
    const { id } = params;

    const data = await req.json();
    const { title, text, sources, courses, tags, permissions } = data;

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

        if (!(await canEditResource(user.id, id, "notes", "note"))) {
            return NextResponse.json(
                {
                    message: "You do not have permission to edit this note",
                },
                { status: 400 }
            );
        }

        const note = await db
            .selectFrom("notes")
            .select(({ eb }) => ["id", "createdBy", getResourcePermissions("note", id, eb)])
            .where("id", "=", id)
            .executeTakeFirst();

        if (!note) {
            return NextResponse.json(
                {
                    message: "Note not found",
                },
                { status: 404 }
            );
        }

        if (!areFieldsEqual(permissions, note.permissions) && note.createdBy !== user.id) {
            return NextResponse.json(
                {
                    message: "You do not have permission to edit permissions for this note",
                },
                { status: 403 }
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
                { status: 400 }
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

export async function DELETE(req, props) {
    const params = await props.params;
    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value });
        if (!user) return unauthorized;

        const { id } = params;

        if (!(await canDeleteResource(user.id, id, "notes"))) {
            return NextResponse.json(
                {
                    message: "You do not have permission to delete this note",
                },
                { status: 404 }
            );
        }

        await db.deleteFrom("notes").where("id", "=", id).execute();

        return NextResponse.json(
            {
                message: "Successfully deleted note",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
