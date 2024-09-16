import { catchRouteError, getNanoId } from "@/lib/db/helpers";
import { unauthorized } from "@/lib/apiErrorResponses";
import { Validator } from "@/lib/validation";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";

export async function POST(req) {
    const publicId = getNanoId();
    let courseId = null;

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const validator = new Validator();

        const course = await req.json();
        const {
            name,
            description,
            enrollment,
            parents,
            prerequisites,
            sources,
            notes,
            quizzes,
            addAllFromSources,
            addAllFromNotes,
            permissions: perm,
        } = course;

        validator.validateAll(
            [
                {
                    field: "name",
                    value: name,
                },
                {
                    field: "description",
                    value: description,
                },
                {
                    field: "enrollment",
                    value: enrollment,
                },
                {
                    field: "parents",
                    value: parents,
                },
                {
                    field: "prerequisites",
                    value: prerequisites,
                },
                {
                    field: "sources",
                    value: sources,
                },
                {
                    field: "notes",
                    value: notes,
                },
                {
                    field: "quizzes",
                    value: quizzes,
                },
                {
                    field: "addAllFromSources",
                    value: addAllFromSources,
                },
                {
                    field: "addAllFromNotes",
                    value: addAllFromNotes,
                },
            ],
            "course",
        );

        const permissions = validator.validatePermissions(perm, true);

        if (!validator.isValid) {
            return NextResponse.json(
                {
                    message: "Invalid course data.",
                    errors: validator.errors,
                },
                { status: 400 },
            );
        }

        await db
            .insertInto("courses")
            .values({
                publicId,
                name,
                description,
                enrollment,
                createdBy: user.id,
            })
            .execute();

        courseId = (
            await db
                .selectFrom("courses")
                .select("id")
                .where("publicId", "=", publicId)
                .executeTakeFirstOrThrow()
        ).id;

        await db
            .insertInto("course_users")
            .values({
                courseId,
                userId: user.id,
                role: "owner",
            })
            .execute();

        await db
            .insertInto("resource_permissions")
            .values({
                resourceId: courseId,
                resourceType: "course",
                ...permissions,
            })
            .execute();

        if (parents.length || prerequisites.length) {
            await db
                .insertInto("course_hierarchy")
                .values([
                    ...parents.map((p) => ({
                        inferior: courseId,
                        superior: p.id,
                        relationship: "encompasses",
                    })),
                    ...prerequisites.map((p) => ({
                        inferior: courseId,
                        superior: p.id,
                        relationship: "prerequisite",
                        // averageLevelRequired: p.requiredAverageLevel,
                    })),
                ])
                .execute();
        }

        if (sources.length || notes.length || quizzes.length) {
            await db
                .insertInto("resource_relations")
                .values([
                    ...sources.map((s) => ({
                        A: courseId,
                        B: s.id,
                        A_type: "course",
                        B_type: "source",
                        includeReference: addAllFromSources,
                        // reference: null,
                        // referenceType: "page",
                    })),
                    ...notes.map((n) => ({
                        A: courseId,
                        B: n.id,
                        A_type: "course",
                        B_type: "note",
                        includeReference: addAllFromNotes,
                        // reference: null,
                        // referenceType: "page",
                    })),
                    ...quizzes.map((q) => ({
                        A: courseId,
                        B: q.id,
                        A_type: "course",
                        B_type: "quiz",
                        includeReference: false,
                        // reference: null,
                        // referenceType: "page",
                    })),
                ])
                .execute();
        }

        return NextResponse.json(
            {
                message: "Course created successfully",
                content: {
                    id: courseId,
                    publicId,
                    ...course,
                },
            },
            { status: 201 },
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
