import { unauthorized } from "@/lib/apiErrorResponses";
import { catchRouteError } from "@/lib/db/helpers";
import { Validator } from "@/lib/validation";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";

export async function POST(req, props) {
    const params = await props.params;
    const { id } = params;

    const { type, reason, link } = await req.json();

    const validator = new Validator();

    validator.validateAll(
        [
            ["type", type],
            ["reason", reason],
            ["link", link],
        ].map(([field, value]) => ({ field, value })),
        "report"
    );

    if (!validator.isValid) {
        return NextResponse.json(
            {
                message: "Invalid report data",
                errors: validator.errors,
            },
            { status: 400 }
        );
    }

    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value || "" });
        if (!user) return unauthorized;

        if (id === user.id) {
            return NextResponse.json(
                {
                    message: "You can't report yourself",
                },
                { status: 400 }
            );
        }

        const reported = await useUser({ id });

        if (!reported) {
            return NextResponse.json(
                {
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        await db
            .insertInto("user_reports")
            .values({
                reporter: user.id,
                reported: reported.id,
                type,
                reason,
                link,
            })
            .execute();

        return NextResponse.json(
            {
                message: "Successfully reported user",
            },
            { status: 201 }
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
