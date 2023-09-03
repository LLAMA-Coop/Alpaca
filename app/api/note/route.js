import { NextResponse } from "next/server";
import { queryReadableResources, useUser } from "@/lib/auth";
import { Note } from "@mneme_app/database-models";
import { server, unauthorized } from "@/lib/apiErrorResponses";

export async function GET(req) {
    try {
        const user = await useUser();
        if (!user) {
            return unauthorized;
        }

        const content = await Note.find(queryReadableResources(user));
        return NextResponse.json(
            {
                content,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error(`[Note] GET error: ${error}`);
        return server;
    }
}

export async function POST(req) {
    try {
        const user = await useUser();

        if (!user) {
            return unauthorized;
        }

        const { text, sources } = await req.json();

        // Will need to redesign once images/videos are permitted in notes

        if (!text) {
            return NextResponse.json(
                {
                    message: "No text was added to this note",
                },
                { status: 400 },
            );
        }

        if (sources.length < 1) {
            return NextResponse.json(
                {
                    message: "At least one source is required to create a note",
                },
                { status: 400 },
            );
        }

        const noteRcvd = {
            createdBy: user._id,
            text: text,
            sources: [...sources],
            contributors: [user._id],
        };

        const note = new Note(noteRcvd);
        const content = await note.save();
        return NextResponse.json({ content }, { status: 201 });
    } catch (error) {
        console.error(`[Note] POST error: ${error}`);
        return server;
    }
}
