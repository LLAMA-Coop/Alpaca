import { unauthorized } from "@/lib/apiErrorResponses";
import { catchRouteError } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";

export async function DELETE(req, props) {
    const params = await props.params;
    const { id } = params;

    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value, select: ["role"] });
        if (user?.role !== "admin") return unauthorized;

        await db.deleteFrom("error_logs").where("id", "=", id).execute();

        return NextResponse.json(
            {
                message: "Successfully deleted error log",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}

export async function PUT(req, props) {
    const params = await props.params;
    const { id } = params;
    const { note } = await req.json();

    if (note.length > 1024) {
        return NextResponse.json(
            {
                message: "Note is too long",
            },
            { status: 400 }
        );
    }

    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value, select: ["role"] });
        if (user?.role !== "admin") return unauthorized;

        await db
            .updateTable("error_logs")
            .set({
                note,
            })
            .where("id", "=", id)
            .execute();

        return NextResponse.json(
            {
                message: "Successfully updated error log",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
