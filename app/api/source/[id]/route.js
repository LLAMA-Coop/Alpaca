import { unauthorized } from "@/lib/apiErrorResponses";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";
import {
    canDeleteResource,
    canEditResource,
    catchRouteError,
    updateSource,
} from "@/lib/db/helpers.js";

export async function PATCH(req, { params }) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const { id } = params;

        const {
            title,
            medium,
            url,
            publishedAt,
            lastAccessed,
            tags,
            authors,
            courses,
            permissions,
        } = await req.json();

        if (!(await canEditResource(user.id, id, "source"))) {
            return NextResponse.json(
                {
                    message: "You do not have permission to edit this source.",
                },
                { status: 404 },
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
                    message: "Invalid source data.",
                    errors: content.errors,
                },
                { status: 400 },
            );
        }

        return NextResponse.json({
            message: "Successfully updated source.",
            content,
        });
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}

export async function DELETE(req, { params }) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const { id } = params;

        if (!(await canDeleteResource(user.id, id, "source"))) {
            return NextResponse.json(
                {
                    message:
                        "You do not have permission to delete this source.",
                },
                { status: 403 },
            );
        }

        await db.deleteFrom("sources").where("id", "=", id).execute();

        return NextResponse.json(
            {
                message: "Successfully deleted source.",
            },
            { status: 200 },
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
