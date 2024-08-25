import { unauthorized } from "@/lib/apiErrorResponses";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";
import { addError } from "@/lib/db/helpers";

export async function POST(req, { params }) {
    const { id } = params;

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const [decline, fields] = await db
            .promise()
            .query("DELETE FROM `Notifications` WHERE `id` = ?", [id]);

        return NextResponse.json(
            {
                success: true,
                message: "Successfully declined associate request.",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("[ERROR] /api/associates/id/decline:POST ", error);
        addError(error, '/api/associates/id/decline: POST')
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 },
        );
    }
}
