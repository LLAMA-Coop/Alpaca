import { canUserWriteToGroup, catchRouteError } from "@/lib/db/helpers";
import { unauthorized } from "@/lib/apiErrorResponses";
import { Validator } from "@/lib/validation";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";

// UPDATE GROUP

export async function PATCH(req, props) {
    const params = await props.params;
    const { id } = params;
    const { name, description, icon, isPublic } = await req.json();

    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value });
        if (!user) return unauthorized;

        if (!(await canUserWriteToGroup(user.id, id))) {
            return unauthorized;
        }

        const validator = new Validator();

        validator.validateAll(
            [
                ["name", name],
                ["description", description],
                ["icon", icon],
                ["isPublic", isPublic],
            ].map(([field, value]) => ({ field, value })),
            "group",
        );

        if (!validator.isValid) {
            return NextResponse.json(
                {
                    message: "Invalid input",
                    errors: validator.errors,
                },
                { status: 400 },
            );
        }

        if (name || description || icon || isPublic) {
            await db
                .updateTable("groups")
                .set({
                    name,
                    description,
                    icon,
                    isPublic,
                })
                .execute();
        }

        return NextResponse.json(
            {
                message: "Successfully updated group",
            },
            { status: 200 },
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
