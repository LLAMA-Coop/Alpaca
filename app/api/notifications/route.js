import { unauthorized } from "@/lib/apiErrorResponses";
import { catchRouteError } from "@/lib/db/helpers.js";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";

// READ ALL NOTIFICATIONS

export async function PATCH(req) {
    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value });
        if (!user) return unauthorized;

        await db
            .updateTable("notifications")
            .set({ isRead: 1 })
            .where("recipientId", "=", user.id)
            .execute();

        return NextResponse.json(
            {
                message: "Successfully marked all notifications as read",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}

// DELETE ALL NOTIFICATIONS

export async function DELETE(req) {
    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value });
        if (!user) return unauthorized;

        await db.deleteFrom("notifications").where("recipientId", "=", user.id).execute();

        return NextResponse.json(
            {
                message: "Successfully deleted all notifications",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
