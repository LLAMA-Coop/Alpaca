import { NextResponse } from "next/server";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { server, unauthorized } from "@/lib/apiErrorResponses";
import { addError, getNotesById } from "@/lib/db/helpers.js";
import { db } from "@/lib/db/db.js";

export async function DELETE(req, { params }) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });

        if (!user) {
            return unauthorized;
        }

        const { _id } = params;

        const note = (await getNotesById({ id: _id, userId: user.id }))[0];
        if (!note) {
            return NextResponse.json(
                {
                    message: `The note ${_id} could not be found to delete`,
                },
                { status: 404 },
            );
        }

        const isCreator =
            (note.createdBy && note.createdBy == user.id) ||
            (note.creator && note.creator.id == user.id);

        if (!isCreator) {
            return NextResponse.json(
                {
                    message: `User ${user.id} is not authorized to delete note ${_id}. Only the creator ${note.createdBy} is permitted`,
                },
                { status: 403 },
            );
        }

        const [deletion, fields] = await db
            .promise()
            .query("DELETE FROM `Notes` WHERE `id` = ?", [_id]);
        if (deletion.affectedRows === 0) {
            console.error(`Unable to delete note ${_id}`);
            addError(
                { stack: deletion },
                `Unable to delete note ${_id} /api/note/[_id]: DELETE`,
            );
            return NextResponse.json(
                {
                    message: `Unable to delete note ${_id}`,
                },
                { status: 500 },
            );
        }
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error(`[Note] DELETE error:\n ${error}`);
        addError(error, "/api/note/[_id]: DELETE");
        return server;
    }
}
