import { catchRouteError, isUserBlocked } from "@/lib/db/helpers";
import { unauthorized } from "@/lib/apiErrorResponses";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";

// BLOCK USER

export async function POST(req, props) {
    const params = await props.params;
    const { id } = params;

    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value || "" });
        if (!user) return unauthorized;

        if (id === user.id) {
            return NextResponse.json(
                {
                    message: "You can't block yourself",
                },
                { status: 400 }
            );
        }

        if (await isUserBlocked(user.id, id)) {
            return NextResponse.json(
                {
                    message: "User already blocked",
                },
                { status: 400 }
            );
        }

        await db
            .insertInto("blocked")
            .values({
                blocker: user.id,
                blocked: id,
            })
            .execute();

        await db
            .deleteFrom("associates")
            .where(({ eb, or, and }) =>
                or([
                    and([eb("A", "=", user.id), eb("B", "=", id)]),
                    and([eb("A", "=", id), eb("B", "=", user.id)]),
                ])
            )
            .execute();

        await db
            .deleteFrom("notifications")
            .where(({ eb, and, or }) =>
                and([
                    eb("type", "=", "request"),
                    or([
                        and([eb("senderId", "=", user.id), eb("recipientId", "=", id)]),
                        and([eb("senderId", "=", id), eb("recipientId", "=", user.id)]),
                    ]),
                ])
            )
            .execute();

        return NextResponse.json(
            {
                message: "Successfully blocked user",
            },
            { status: 201 }
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}

export async function DELETE(req, props) {
    const params = await props.params;
    const { id } = params;

    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value || "" });
        if (!user) return unauthorized;

        if (id === user.id) {
            return NextResponse.json(
                {
                    message: "You can't unblock yourself",
                },
                { status: 400 }
            );
        }

        if (!(await isUserBlocked(user.id, id))) {
            return NextResponse.json(
                {
                    message: "User not blocked",
                },
                { status: 400 }
            );
        }

        await db.deleteFrom("blocked").where({ blocker: user.id, blocked: id }).execute();

        return NextResponse.json(
            {
                message: "Successfully unblocked user",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
