import { catchRouteError, getNanoId, isGroupNameTaken } from "@/lib/db/helpers";
import { unauthorized } from "@/lib/apiErrorResponses";
import { Validator } from "@/lib/validation";
import { utapi } from "@/lib/uploadthing.s";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";

// CREATE GROUP

export async function POST(req) {
    const publicId = getNanoId();
    let groupId = null;

    const group = await req.json();
    const { name, description, icon, isPublic } = group;

    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value });

        if (!user) {
            icon && (await utapi.deleteFiles(icon));
            return unauthorized;
        }

        const validator = new Validator();

        validator.validateAll(
            [
                ["name", name.trim()],
                ["description", description.trim()],
                ["icon", icon],
                ["isPublic", isPublic],
            ].map(([field, value]) => ({ field, value })),
            "group",
        );

        if (!validator.isValid) {
            icon && (await utapi.deleteFiles(icon));
            return NextResponse.json(
                {
                    message: "Invalid group data",
                    errors: validator.errors,
                },
                { status: 400 },
            );
        }

        if (await isGroupNameTaken(name)) {
            icon && (await utapi.deleteFiles(icon));
            return NextResponse.json(
                {
                    message: "Group name is already taken",
                    errors: {
                        name: "Group name is already taken",
                    },
                },
                { status: 400 },
            );
        }

        await db
            .insertInto("groups")
            .values({
                publicId,
                name,
                description,
                icon,
                isPublic,
                createdBy: user.id,
            })
            .execute();

        groupId = (
            await db
                .selectFrom("groups")
                .select("id")
                .where("publicId", "=", publicId)
                .executeTakeFirstOrThrow()
        ).id;

        await db
            .insertInto("members")
            .values({
                groupId,
                userId: user.id,
                role: "owner",
            })
            .execute();

        return NextResponse.json(
            {
                message: "Successfully created group",
                content: {
                    id: groupId,
                    publicId,
                    ...group,
                },
            },
            { status: 201 },
        );
    } catch (error) {
        db.deleteFrom("groups").where("publicId", "=", publicId).execute();

        if (groupId) {
            db.deleteFrom("members").where("groupId", "=", groupId).execute();
        }

        icon && (await utapi.deleteFiles(icon));

        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
