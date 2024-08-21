import { NextResponse } from "next/server";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { unauthorized, server } from "@/lib/apiErrorResponses";
import SubmitErrors from "@/lib/SubmitErrors";
import { MAX } from "@/lib/constants";
import {
    getPermittedSources,
    insertPermissions,
    sqlDate,
} from "@/lib/db/helpers";
import { db } from "@/lib/db/db.js";

export async function GET(req) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) {
            return unauthorized;
        }

        const content = await getPermittedSources(user.id);
        return NextResponse.json({ content }, { status: 200 });
    } catch (error) {
        console.error(`[Source] GET error: ${error}`);
        return server;
    }
}

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

        if (!title) {
            submitErrors.addError("Missing title");
        } else if (title.length > MAX.title) {
            submitErrors.addError(
                `The following title is longer than the maximum permitted, which is ${MAX.title} characters:\n ${title}`,
            );
        }

        if (!medium) {
            submitErrors.addError("Missing medium");
        } else if (medium === "website" && !url) {
            submitErrors.addError("A website requires a URL");
        }

        authors.forEach((author) => {
            if (typeof author !== "string") {
                submitErrors.addError(
                    `The following author is not valid:\n  ${author.toString()}`,
                );
                return;
            }
            if (author.length > MAX.name) {
                submitErrors.addError(
                    `The following author name is longer than the maximum permitted, which is ${MAX.name} characters: \n ${author}`,
                );
            }
        });

        tags.forEach((tag) => {
            if (typeof tag !== "string") {
                submitErrors.addError(
                    `The following tag is not valid:\n ${tag.toString()}`,
                );
                return;
            }
            if (tag.length > MAX.tag) {
                submitErrors.addError(
                    `The following tag is longer than the maximum permitted, which is ${MAX.tag} characters: \n ${tag}`,
                );
            }
        });

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
            "source",
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

        const sources = await getPermittedSources(user.id);

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
            // locationTypeDefault,
            permissions,
        } = await req.json();

        // const source = await Source.findById(_id);
        const source = sources.find((x) => x.id === id);

        if (!source) {
            return NextResponse.json(
                {
                    message: `No source found with id ${id}`,
                },
                { status: 404 },
            );
        }

        if (source.permissionType !== "write") {
            return NextResponse.json(
                {
                    message: `You are not permitted to edit source ${id}`,
                },
                { status: 403 },
            );
        }

        const columns = [];

        if (title) {
            // source.title = title.trim();
            columns.push({ name: "title", value: title.trim() });
        }
        if (medium) {
            // source.medium = medium;
            if (
                [
                    "book",
                    "article",
                    "video",
                    "podcast",
                    "website",
                    "audio",
                ].includes(medium)
            ) {
                columns.push({ name: "medium", value: medium });
            } else {
                console.error(`The medium ${medium} is not recognized`);
                columns.push({ name: "medium", value: null });
            }
        }
        if (url) {
            // source.url = url;
            // Can set up regex to verify proper URL
            columns.push({ name: "url", value: url });
        }
        if (tags) {
            // source.tags = [...tags];
            // B/c `tags` is JSON/LONGTEXT, need to overwrite either way
            columns.push({ name: "tags", value: JSON.stringify(tags) });
        }
        if (publishDate) {
            // source.publishDate = publishDate;
            columns.push({
                name: "publishedUpdated",
                value: sqlDate(publishDate),
            });
        }
        if (lastAccessed) {
            // source.lastAccessed = lastAccessed;
            columns.push({
                name: "lastAccessed",
                value: sqlDate(lastAccessed),
            });
        }
        // if (locationTypeDefault) {
        //     source.locationTypeDefault = locationTypeDefault;
        // }
        // No longer used
        // Taken care of with ResourceSources table, for each resource that cites a source

        const setClause = columns.map((col) => `${col.name} = ?`).join(", ");
        const query = `UPDATE Sources SET ${setClause} WHERE \`id\` = ?`;

        const [sourceResults, sourceFields] = await db
            .promise()
            .query(query, [...columns.map((x) => x.value), id]);

        if (authors) {
            // source.authors = [...authors];
            // This updates SourceCredits
            // Use updateSourceCredits
        }

        if (courses) {
            // courses.forEach((courseId_req) => {
            //     if (
            //         !source.courses.find(
            //             (course) => course._id.toString() === courseId_req,
            //         )
            //     ) {
            //         source.courses.push(new Types.ObjectId(courseId_req));
            //     }
            // });
            // This updates CourseResources
            // Use updateCourseResources
        }

        if (permissions && source.createdBy.toString() === user.id.toString()) {
            // source.permissions = serializeOne(permissions);
            // This updates ResourcePermissions
            // Use updatePermissions
        }

        // source.updateBy = user.id;
        // Use resourceContribution

        // const content = await source.save();
        return NextResponse.json({ content: { sourceResults, query } });
    } catch (error) {
        console.error(`[Source] PUT error: ${error}`);
        return server;
    }
}
