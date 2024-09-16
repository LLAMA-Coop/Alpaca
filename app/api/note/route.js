import { catchRouteError, getNanoId } from "@/lib/db/helpers";
import { unauthorized } from "@/lib/apiErrorResponses";
import { Validator } from "@/lib/validation";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";

export async function POST(req) {
    const publicId = getNanoId();
    let noteId = null;

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const note = await req.json();
        const { title, text, sources, courses, tags, permissions: perm } = note;

        const validator = new Validator();

        validator.validate(
            [
                {
                    field: "title",
                    value: title,
                },
                {
                    field: "text",
                    value: text,
                },
                {
                    field: "sources",
                    value: sources,
                },
                {
                    field: "tags",
                    value: tags,
                },
            ],
            "note",
        );

        validator.validate([
            {
                field: "tags",
                value: tags,
                type: "misc",
            },
        ]);

        const permissions = validator.validatePermissions(perm, true);

        if (!validator.isValid) {
            return NextResponse.json(
                {
                    message: "Invalid note data.",
                    errors: validator.errors,
                },
                { status: 400 },
            );
        }

        await db
            .insertInto("notes")
            .values({
                publicId,
                title,
                text,
                tags: JSON.stringify(tags),
                createdBy: user.id,
            })
            .execute();

        noteId = (
            await db
                .selectFrom("notes")
                .select("id")
                .where("publicId", "=", publicId)
                .executeTakeFirstOrThrow()
        ).id;

        await db
            .insertInto("resource_permissions")
            .values({
                resourceId: noteId,
                resourceType: "note",
                ...permissions,
            })
            .execute();

        if (courses.length) {
            await db
                .insertInto("resource_relations")
                .values(
                    courses.map((c) => ({
                        A: c,
                        B: noteId,
                        A_type: "course",
                        B_type: "note",
                        // includeReference: c.includeReference || false,
                        // reference: c.reference || null,
                        // referenceType: c.referenceType || null,
                    })),
                )
                .execute();
        }

        if (sources.length) {
            await db
                .insertInto("resource_relations")
                .values(
                    sources.map((s) => ({
                        A: s,
                        B: noteId,
                        A_type: "source",
                        B_type: "note",
                        // includeReference: s.includeReference || false,
                        // reference: s.reference || null,
                        // referenceType: s.referenceType || null,
                    })),
                )
                .execute();
        }

        return NextResponse.json(
            {
                message: "Note created successfully",
                content: {
                    id: noteId,
                    publicId,
                    ...note,
                },
            },
            { status: 201 },
        );
    } catch (error) {
        db.deleteFrom("notes").where("publicId", "=", publicId).execute();

        if (noteId) {
            db.deleteFrom("resource_permissions")
                .where("resourceId", "=", noteId)
                .execute();
        }

        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
