import { catchRouteError, getNanoId } from "@/lib/db/helpers";
import { unauthorized } from "@/lib/apiErrorResponses";
import { Validator } from "@/lib/validation";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";

// CREATE SOURCE

export async function POST(req) {
    const publicId = getNanoId();
    let sourceId = null;

    const source = await req.json();
    const {
        title,
        medium,
        url,
        publishedAt,
        lastAccessed, // Do we want publishedUpdated to be the one date? Good question...
        authors,
        courses,
        tags,
        permissions: perm,
    } = source;

    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value });
        if (!user) return unauthorized;

        const validator = new Validator();

        validator.validateAll(
            [
                ["title", title],
                ["medium", medium],
                ["url", url],
                ["publishedAt", publishedAt],
                ["lastAccessed", lastAccessed],
                ["authors", authors],
            ].map(([field, value]) => ({ field, value })),
            "source"
        );

        validator.validate({ field: "tags", value: tags, type: "misc" });

        if (medium === "website" && !url) {
            validator.errors.url = "Website sources must have a URL";
            validator.isValid = false;
        }

        const permissions = validator.validatePermissions(perm, true);

        if (!validator.isValid) {
            return NextResponse.json(
                {
                    message: "Invalid source data",
                    errors: validator.errors,
                },
                { status: 400 }
            );
        }

        await db
            .insertInto("sources")
            .values({
                publicId,
                title,
                medium,
                url,
                tags: JSON.stringify(tags),
                credits: JSON.stringify(authors),
                createdBy: user.id,
                publishedAt: publishedAt?.split("T")[0] || null,
            })
            .execute();

        sourceId = (
            await db
                .selectFrom("sources")
                .select("id")
                .where("publicId", "=", publicId)
                .executeTakeFirstOrThrow()
        ).id;

        await db
            .insertInto("resource_permissions")
            .values({
                resourceId: sourceId,
                resourceType: "source",
                ...permissions,
            })
            .execute();

        if (courses.length > 0) {
            db.insertInto("resource_relations")
                .values(
                    courses.map((course) => ({
                        A: sourceId,
                        B: course.id,
                        A_type: "source",
                        B_type: "course",
                        includeReference: course.includeReference || false,
                    }))
                )
                .execute();
        }

        return NextResponse.json(
            {
                message: "Successfully created source",
                content: {
                    id: sourceId,
                    publicId,
                    ...source,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        db.deleteFrom("sources").where("publicId", "=", publicId).execute();

        if (sourceId) {
            db.deleteFrom("resource_permissions").where("resourceId", "=", sourceId).execute();
        }

        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
