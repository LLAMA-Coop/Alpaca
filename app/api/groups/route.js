import { catchRouteError, getNanoId, isGroupNameTaken } from "@/lib/db/helpers";
import { unauthorized } from "@/lib/apiErrorResponses";
import { Validator } from "@/lib/validation";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";

export async function POST(req) {
    const publicId = getNanoId();
    let groupId = null;

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const group = await req.json();
        const { name, description, icon, isPublic } = group;

        const validator = new Validator();

        validator.validateAll([
            {
                field: "name",
                value: name.trim(),
            },
            {
                field: "description",
                value: description.trim(),
            },
            {
                field: "icon",
                value: icon,
            },
            {
                field: "isPublic",
                value: isPublic,
            },
        ]);

        if (!validator.isValid) {
            return NextResponse.json(
                {
                    message: "Invalid group data.",
                    errors: validator.errors,
                },
                { status: 400 },
            );
        }

        if (await isGroupNameTaken(name)) {
            return NextResponse.json(
                {
                    message: "Group name is already taken.",
                    errors: {
                        name: "Group name is already taken.",
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
                message: "Successfully created group.",
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

        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
