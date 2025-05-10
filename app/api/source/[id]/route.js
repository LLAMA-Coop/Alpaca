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
    updateSource,
} from "@/lib/db/helpers.js";

// UPDATE SOURCE

export async function PATCH(req, props) {
    const params = await props.params;
    const { id } = params;

    const data = await req.json();
    const { title, medium, url, publishedAt, lastAccessed, tags, authors, courses, permissions } =
        data;

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

        if (!(await canEditResource(user.id, id, "sources", "source"))) {
            return NextResponse.json(
                {
                    message: "You do not have permission to edit this source",
                },
                { status: 400 }
            );
        }

        const source = await db
            .selectFrom("sources")
            .select(({ eb }) => ["id", "createdBy", getResourcePermissions("source", id, eb)])
            .where("id", "=", id)
            .executeTakeFirst();

        if (!source) {
            return NextResponse.json(
                {
                    message: "Source not found",
                },
                { status: 404 }
            );
        }

        if (!areFieldsEqual(permissions, source.permissions) && source.createdBy !== user.id) {
            return NextResponse.json(
                {
                    message: "You do not have permission to edit permissions for this source",
                },
                { status: 403 }
            );
        }

        const content = await updateSource({
            id,
            title,
            medium,
            url,
            tags,
            publishedAt,
            lastAccessed,
            authors,
            courses,
            permissions,
            contributorId: user.id,
        });

        if (!content.valid) {
            return NextResponse.json(
                {
                    message: "Invalid source data",
                    errors: content.errors,
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            message: "Successfully updated source",
        });
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}

// DELETE SOURCE

export async function DELETE(req, props) {
    const params = await props.params;
    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value });
        if (!user) return unauthorized;

        const { id } = params;

        if (!(await canDeleteResource(user.id, id, "sources"))) {
            return NextResponse.json(
                {
                    message: "You do not have permission to delete this source",
                },
                { status: 403 }
            );
        }

        await db.deleteFrom("sources").where("id", "=", id).execute();

        return NextResponse.json(
            {
                message: "Successfully deleted source",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
