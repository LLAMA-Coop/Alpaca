import { catchRouteError, isUserInGroup } from "@/lib/db/helpers";
import { unauthorized } from "@/lib/apiErrorResponses";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";

// ACCEPT GROUP INVITE

export async function POST(req, props) {
    const params = await props.params;
    const { id, memberId } = params;

    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value });
        if (!user) return unauthorized;

        const invite = await db
            .selectFrom("notifications")
            .select("id")
            .where("type", "=", "invite")
            .where("recipientId", "=", memberId)
            .where("groupId", "=", id)
            .executeTakeFirst();

        if (!invite) {
            return NextResponse.json(
                {
                    message: "This user hasn't been invited to this group yet",
                },
                { status: 404 },
            );
        }

        if (await isUserInGroup(memberId, id)) {
            return NextResponse.json(
                {
                    message: "User is already in group",
                },
                { status: 400 },
            );
        }

        await db
            .insertInto("members")
            .values({
                userId: memberId,
                groupId: id,
                role: "user",
            })
            .execute();

        db.deleteFrom("notifications").where("id", "=", invite.id).execute();

        return NextResponse.json(
            {
                message: "Successfully joined group",
            },
            { status: 200 },
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
