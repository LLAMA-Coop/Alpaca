import { NextResponse } from "next/server";
import { canEdit, queryReadableResources, useUser } from "@/lib/auth";
import { cookies } from "next/headers";
// import { Source } from "@mneme_app/database-models";
import { Source } from "@/app/api/models";
import { unauthorized, server } from "@/lib/apiErrorResponses";
import { buildPermissions } from "@/lib/permissions";
import { serializeOne } from "@/lib/db";

export async function GET(req) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) {
            return unauthorized;
        }

        const content = await Source.find(queryReadableResources(user));
        return NextResponse.json({ content }, { status: 200 });
    } catch (error) {
        console.error(`[Source] GET error: ${error}`);
        return server;
    }
}

export async function POST(req) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) {
            return unauthorized;
        }

        const {
            title,
            medium,
            url,
            publishDate,
            lastAccessed,
            authors,
            tags,
            permissions,
        } = await req.json();

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

        const source = new Source({
            title: title,
            medium: medium,
            url: url,
            publishedAt: publishDate,
            lastAccessed: lastAccessed,
            authors: authors,
            tags: tags,
            createdBy: user._id,
            contributors: [user._id],
        });

        source.permissions = buildPermissions(permissions);

        const content = await source.save();

        return NextResponse.json(
            {
                message: "Source created successfully",
                content,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error(`[Source] POST error: ${error}`);
        return server;
    }
}

export async function PUT(req) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });

        if (!user) {
            return unauthorized;
        }

        const {
            _id,
            title,
            medium,
            url,
            publishDate,
            lastAccessed,
            authors,
            tags,
            permissions,
        } = await req.json();

        const source = await Source.findById(_id);
        if (!source) {
            return NextResponse.json(
                {
                    message: `No source found with id ${_id}`,
                },
                { status: 404 },
            );
        }

        if (!canEdit(source, user)) {
            return NextResponse.json(
                {
                    message: `You are not permitted to edit source ${_id}`,
                },
                { status: 403 },
            );
        }

        if (title) {
            source.title = title;
        }
        if (medium) {
            source.medium = medium;
        }
        if (url) {
            source.url = url;
        }
        if (publishDate) {
            source.publishDate = publishDate;
        }
        if (lastAccessed) {
            source.lastAccessed = lastAccessed;
        }
        if (authors) {
            source.authors = [...authors];
        }
        if (tags) {
            source.tags = [...tags];
        }
        if (permissions && source.createdBy.toString() === user._id) {
            source.permissions = serializeOne(permissions);
        }
        source.updateBy = user._id;

        const content = await source.save();
        return NextResponse.json({ content });
    } catch (error) {
        console.error(`[Source] PUT error: ${error}`);
        return server;
    }
}
