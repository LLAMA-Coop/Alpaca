import { NextResponse } from "next/server";
import Note from "@models/Note";
import { useUser } from "@/lib/auth";

export async function GET(req) {
    const content = await Note.find();
    return NextResponse.json({
        200: {
            content,
        },
    });
}

export async function POST(req) {
    const user = await useUser();
    if (!user) {
        return NextResponse.json({
            403: {
                message: "Login required",
            },
        });
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
        contributors: [user._id]
    };

    const note = new Note(noteRcvd);
    const content = await note.save();
    return NextResponse.json({ content }, { status: 201 });
}
