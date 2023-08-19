import { NextResponse } from "next/server";
import { useUser } from "@/lib/auth";
import Source from "@models/Source";
import { unauthorized } from "@/lib/apiErrorResponses";

export async function GET(req) {
    const content = await Source.find();
    return NextResponse.json({ content }, { status: 200 });
}

export async function POST(req) {
    const user = await useUser();

    if (!user) {
        return unauthorized;
    }

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
            addedBy: user._id,
            contributors: [user._id],
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
                message: "Something went wrong",
            },
            { status: 500 },
        );
    }
}
