import { unauthorized, server } from "@/lib/apiErrorResponses";
import SubmitErrors from "@/lib/SubmitErrors";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { MAX } from "@/lib/constants";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";
import {
    getPermittedSources,
    getSourcesById,
    insertPermissions,
    updateSource,
} from "@/lib/db/helpers";
import { validation } from "@/lib/validation";

export async function POST(req) {
    const baseQuery = `INSERT INTO \`Sources\`
        (\`title\`, \`medium\`, \`url\`, \`tags\`, \`createdBy\`, \`publishedUpdated\`) 
        VALUES (?, ?, ?, ?, ?, ?)`;

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const {
            title,
            medium,
            url,
            publishDate,
            lastAccessed, // Do we want publishedUpdated to be the one date?
            authors,
            courses,
            tags,
            locationTypeDefault,
            permissions,
        } = await req.json();

        const submitErrors = new SubmitErrors();

        if (
            title?.length < 1 ||
            title?.length > validation.source.title.maxLength
        ) {
            submitErrors.addError("Title must be between 1 and 100 characters");
        }

        if (!medium) {
            submitErrors.addError("A medium is required");
        } else if (medium === "website" && !url) {
            submitErrors.addError("A URL is required for a website source");
        }

        const validAuthors = (authors || []).filter(
            (a) =>
                typeof a === "string" &&
                a.length >= validation.source.author.name.minLength &&
                a.length <= validation.source.author.name.maxLength,
        );

        const validTags = (tags || []).filter(
            (t) =>
                typeof t === "string" &&
                t.length >= validation.tag.minLength &&
                t.length <= validation.tag.maxLength,
        );

        if (submitErrors.cannotSend) {
            return NextResponse.json(
                { message: submitErrors.displayErrors() },
                { status: 400 },
            );
        }

        const fieldsArray = [
            title,
            medium,
            url,
            JSON.stringify(tags),
            user.id,
            publishDate.split("T")[0],
        ];

        const [sourceInsert, fields] = await db
            .promise()
            .query(baseQuery, fieldsArray);

        const sourceId = sourceInsert.insertId;

        // Replace below with insertSourceCredits call
        const creditInsertValues = authors.map((a) => [sourceId, a]);
        const creditsQuery = `INSERT INTO \`SourceCredits\` (sourceId, name) VALUES ?`;

        const [creditsInsert, fieldsCredits] = await db
            .promise()
            .query(creditsQuery, [creditInsertValues]);

        const permsInsert = await insertPermissions(
            permissions,
            sourceId,
            user.id,
        );

        // Next up:
        //  CourseResources (table created)
        const content = sourceInsert;

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
            id,
            title,
            medium,
            url,
            publishDate,
            lastAccessed,
            authors,
            courses,
            tags,
            permissions,
        } = await req.json();

        // const source = (await getSourcesById({ id, userId: user.id }))[0];
        const source = (await getPermittedSources(user.id)).find(
            (x) => x.id == id,
        );

        if (!source) {
            return NextResponse.json(
                {
                    message: `No source found with id ${id}`,
                },
                { status: 404 },
            );
        }

        const isCreator =
            source.createdBy == user.id || source.creator?.id == user.id;
        const canEdit = isCreator || source.permissionType === "write";

        if (!canEdit) {
            return NextResponse.json(
                {
                    message: `You are not permitted to edit source ${id}`,
                },
                { status: 403 },
            );
        }

        const content = updateSource({
            id,
            title,
            medium,
            url,
            tags,
            publishedUpdated: publishDate,
            lastAccessed,
            authors,
            courses,
            permissions: isCreator ? permissions : [],
            contributorId: user.id,
        });

        return NextResponse.json({ content });
    } catch (error) {
        console.error(`[Source] PUT error: ${error}`);
        return server;
    }
}
