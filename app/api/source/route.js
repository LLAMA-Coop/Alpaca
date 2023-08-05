import { NextResponse } from "next/server";
import Source from "@models/Source";

export async function GET(req) {
    const content = await Source.find();
    return NextResponse.json({ content }, { status: 200 });
}

export async function POST(req) {
    const { title, medium, url, publishDate, lastAccessed, authors } =
        await req.json();

    if (!(title && medium && url)) {
        return NextResponse.json(
            { message: "Missing required information" },
            { status: 400 },
        );
    }

    authors.forEach((author) => {
        if (typeof author !== "string" || author.length > 100) {
            return NextResponse.json(
                {
                    message: "Invalid author name",
                },
                { status: 400 },
            );
        }
    });

    try {
        const source = new Source({
            title: title,
            medium: medium,
            url: url,
            publishedAt: publishDate,
            lastAccessed: lastAccessed,
            authors: authors,
            addedBy: "64b841f6f8bfa3dc4d7079e4",
        });

        const content = await source.save();

        return NextResponse.json(
            {
                message: "Source created successfully",
                content: content,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error(`[Source] POST error: ${error}`);
        return NextResponse.json(
            {
                message: "An error occurred while creating the source",
            },
            { status: 500 },
        );
    }
}
