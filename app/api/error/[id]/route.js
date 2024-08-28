import { NextResponse } from "next/server";
import { server, unauthorized } from "@/lib/apiErrorResponses";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { addError } from "@/lib/db/helpers";
import { db } from "@/lib/db/db";

export async function DELETE(req, { params }) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user || !process.env.DEVELOPERS.split(",").includes(user.id)) {
            return unauthorized;
        }

        const { id } = params;

        const [deletion, fields] = await db
            .promise()
            .query("DELETE FROM `ErrorsBugs` WHERE `id` = ?", [id]);

        if (deletion.affectedRows === 0) {
            return NextResponse.json(
                {
                    message: `Unable to delete error/bug with ID ${id}. Not found.`,
                },
                { status: 404 },
            );
        } else {
            return new NextResponse(null, { status: 204 });
        }
    } catch (error) {
        console.error(`[ErrorsBugs] DELETE error:\n ${error}`);
        addError(error, "/api/error/[id]: DELETE");
        return server;
    }
}

export async function PUT(req, { params }) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user || !process.env.DEVELOPERS.split(",").includes(user.id)) {
            return unauthorized;
        }

        const { id } = params;
        const { note } = await req.json();

        const [update, fields] = await db
            .promise()
            .query("UPDATE `ErrorsBugs` SET `devNote` = ? WHERE `id` = ?", [
                note,
                id,
            ]);

        return NextResponse.json({ update });
    } catch (error) {
        console.error(`[ErrorsBugs] PUT error:\n ${error}`);
        addError(error, "/api/error/[id]: PUT");
        return server;
    }
}
