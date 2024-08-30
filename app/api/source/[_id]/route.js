import { NextResponse } from "next/server";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { server, unauthorized } from "@/lib/apiErrorResponses";
import {
    addError,
    getSourcesById,
    getPermittedSources,
} from "@/lib/db/helpers.js";
import { db } from "@/lib/db/db.js";

export async function DELETE(req, { params }) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });

        if (!user) {
            return unauthorized;
        }

        const { _id } = params;

        // const source = await getSourcesById({ id: _id, userId: user.id });
        const source = (await getPermittedSources(user.id)).find(
            (x) => x.id == _id,
        );
        
        if (!source) {
            return NextResponse.json(
                {
                    message: `The source ${_id} could not be found to delete`,
                },
                { status: 404 },
            );
        }

        const isCreator =
            (source.createdBy && source.createdBy == user.id) ||
            (source.creator && source.creator.id == user.id);

        if (!isCreator) {
            return NextResponse.json(
                {
                    message: `User ${
                        user.id
                    } is not authorized to delete source ${_id}. Only the creator ${
                        source.createdBy ? source.createdBy : source.creator?.id
                    } is permitted`,
                },
                { status: 403 },
            );
        }

        const [deletion, fields] = await db
            .promise()
            .query("DELETE FROM `Sources` WHERE `id` = ?", [_id]);
        if (deletion.affectedRows === 0) {
            console.error(`Unable to delete source ${_id}`);
            addError({
                stack: deletion,
                message: `Unable to delete source ${_id}`,
            });
            return NextResponse.json(
                {
                    message: `Unable to delete source ${_id}`,
                },
                { status: 500 },
            );
        }
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error(`[Source] DELETE error:\n ${error}`);
        addError(error, "/api/source/[_id]: DELETE");
        return server;
    }
}
