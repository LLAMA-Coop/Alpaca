import { unauthorized } from "@/lib/apiErrorResponses";
import { catchRouteError } from "@/lib/db/helpers.js";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";

// MARK NOTIFICATION AS READ

export async function PATCH(req, props) {
    const params = await props.params;
    const { id } = params;

    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value });
        if (!user) return unauthorized;

        await db
            .updateTable("notifications")
            .set({ isRead: 1 })
            .where("id", "=", id)
            .where("recipientId", "=", user.id)
            .execute();

        return NextResponse.json(
            {
                message: "Successfully marked notification as read",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}

// DELETE NOTIFICATION

export async function DELETE(req, props) {
    const params = await props.params;
    const { id } = params;

    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value });
        if (!user) return unauthorized;

        await db
            .deleteFrom("notifications")
            .where("id", "=", id)
            .where("recipientId", "=", user.id)
            .execute();

        return NextResponse.json(
            {
                message: "Successfully deleted notification",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
