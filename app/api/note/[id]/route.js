import { NextResponse } from "next/server";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
// import { Note } from "@mneme_app/database-models";
import { Note } from "@/app/api/models";
import { server, unauthorized } from "@/lib/apiErrorResponses";

export async function DELETE(req, { params }) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });

        if (!user) {
            return unauthorized;
        }

        const { id } = params;

        const note = await Note.findById(id);
        if (!note) {
            return NextResponse.json(
                {
                    message: `The note ${id} could not be found to delete`,
                },
                { status: 404 },
            );
        }

        if (note.createdBy.toString() !== user._id.toString()) {
            return NextResponse.json(
                {
                    message: `User ${user._id} is not authorized to delete note ${id}. Only the creator ${note.createdBy} is permitted`,
                },
                { status: 403 },
            );
        }

        const deletion = await Note.deleteOne({ _id: id });
        console.log(deletion);
        if (deletion.deletedCount === 0) {
            console.error(`Unable to delete note ${id}`);
            return NextResponse.json(
                {
                    message: `Unable to delete note ${id}`,
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
