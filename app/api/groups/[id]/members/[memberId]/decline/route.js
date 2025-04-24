import { unauthorized } from "@/lib/apiErrorResponses";
import { catchRouteError } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";

// DECLINE GROUP INVITE

export async function POST(req, props) {
    const params = await props.params;
    const { id } = params;

    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value });
        if (!user) return unauthorized;

        db.deleteFrom("notifications")
            .where("type", "=", "invite")
            .where("recipientId", "=", user.id)
            .where("groupId", "=", id)
            .execute();

        return NextResponse.json(
            {
                message: "Successfully declined invitation",
            },
            { status: 200 },
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
