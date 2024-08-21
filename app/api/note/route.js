import { canEdit, queryReadableResources, useUser } from "@/lib/auth";
import { server, unauthorized } from "@/lib/apiErrorResponses";
import { buildPermissions } from "@/lib/permissions";
import SubmitErrors from "@/lib/SubmitErrors";
import { NextResponse } from "next/server";
import { MIN, MAX } from "@/lib/constants";
// Need to fix how note PUT edits
import { Note } from "@/app/api/models";
import { serializeOne } from "@/lib/db";
import { cookies } from "next/headers";
import { Types } from "mongoose";
import { db } from "@/lib/db/db.js";
import {
    getNotesById,
    getPermittedNotes,
    insertPermissions,
    updateNote,
} from "@/lib/db/helpers";

export async function GET(req) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const content = await getPermittedNotes(user.id);

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
    const noteInsertQuery = `INSERT INTO \`Notes\` (\`title\`, \`text\`, \`tags\`, \`createdBy\`) VALUES (?, ?, ?, ?)`;

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const { title, text, sources, courses, tags, permissions } =
            await req.json();

        const submitErrors = new SubmitErrors();

        if (text.length < MIN.noteText || text.length > MAX.noteText) {
            submitErrors.addError(
                `Text must be between ${MIN.noteText} and ${MAX.noteText} characters long`,
            );
        }

        if (title.length < MIN.title || title.length > MAX.title) {
            submitErrors.addError(
                `Title must be between ${MIN.title} and ${MAX.title} characters long`,
            );
        }

        if (sources.length === 0) {
            submitErrors.addError(
                "At least one source is required to create a note",
            );
        }

        tags.forEach((tag) => {
            if (typeof tag !== "string") {
                return submitErrors.addError(
                    `"${typeof tag}" is not a valid tag type. Tags must be strings.`,
                );
            }

            if (tag.length < MIN.tag || tag.length > MAX.tag) {
                submitErrors.addError(
                    `Tags must be between ${MIN.tag} and ${MAX.tag} characters long`,
                );
            }
        });

        if (submitErrors.cannotSend) {
            return NextResponse.json(
                { message: submitErrors.displayErrors() },
                { status: 400 },
            );
        }

        const fieldsArray = [title, text, JSON.stringify(tags), user.id];

        const [noteInsert, fields] = await db
            .promise()
            .query(noteInsertQuery, fieldsArray);

        const noteId = noteInsert.insertId;

        const noteSourceQuery = `INSERT INTO \`ResourceSources\` (resourceId, resourceType, sourceId, locInSource, locType) VALUES ?`;

        const noteSourceValues = sources.map((s) => [
            noteId,
            "note",
            s,
            "0",
            "page",
        ]);

        const [noteSourceInserts, fieldsNS] = await db
            .promise()
            .query(noteSourceQuery, [noteSourceValues]);

        const permInsert = await insertPermissions(
            permissions,
            noteId,
            "note",
            user.id,
        );

        // const note = new Note({
        //     createdBy: user.id,
        //     title: title.trim(),
        //     text: text.trim(),
        //     sources: [...sources],
        //     courses: courses ?? [],
        //     tags: [...tags],
        //     contributors: [user.id],
        // });

        // note.permissions = buildPermissions(permissions);

        // const content = await note.save();
        const content = noteInsert;
        return NextResponse.json(
            { message: "Note created successfully", content },
            { status: 201 },
        );
    } catch (error) {
        console.error(`[Note] POST error: ${error}`);
        return server;
    }
}

export async function PUT(req) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const { id, title, text, sources, courses, tags, permissions } =
            await req.json();

        const note = (await getNotesById({ id: id, userId: user.id }))[0];
        if (!note) {
            return NextResponse.json(
                {
                    message: `No note found with id ${id}`,
                },
                { status: 404 },
            );
        }

        if (note.permissionType !== "write") {
            return NextResponse.json(
                {
                    message: `You are not permitted to edit note ${id}`,
                },
                { status: 403 },
            );
        }

        const content = await updateNote({
            id,
            title,
            text,
            sources,
            courses,
            tags,
            permissions,
            contributorId: user.id
        });

        return NextResponse.json({ content });
    } catch (error) {
        console.error(`[Note] PUT error: ${error}`);
        return server;
    }
}
