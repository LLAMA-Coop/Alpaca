import { NextResponse } from "next/server";
import { useUser } from "@/lib/auth";
// import { Note } from "@mneme_app/database-models";
import { Note } from "@/app/api/models";
import { server, unauthorized } from "@/lib/apiErrorResponses";

export async function DELETE(req) {
    try {
        const user = await useUser();

        if (!user) {
            return unauthorized;
        }

        const _id = req.nextUrl.pathname.split("/")[3];

        const note = await Note.findById(_id);
        if (!note) {
            return NextResponse.json(
                {
                    message: `The note ${_id} could not be found to delete`,
                },
                { status: 404 },
            );
        }

        if (note.createdBy.toString() !== user._id.toString()) {
            return NextResponse.json(
                {
                    message: `User ${user._id} is not authorized to delete note ${_id}. Only the creator ${note.createdBy} is permitted`,
                },
                { status: 403 },
            );
        }

        const deletion = await Note.deleteOne({ _id });
        console.log(deletion);
        if (deletion.deletedCount === 0) {
            console.error(`Unable to delete note ${_id}\nError: ${error}`);
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
        return server;
    }
}
