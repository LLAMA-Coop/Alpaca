import { catchRouteError, getNanoId } from "@/lib/db/helpers";
import { unauthorized } from "@/lib/apiErrorResponses";
import { Validator } from "@/lib/validation";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";

// CREATE COURSE
export async function POST(req) {
    const publicId = getNanoId();
    let courseId = null;

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

    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value });
        if (!user) return unauthorized;

        const validator = new Validator();

        validator.validateAll(
            [
                ["name", name],
                ["description", description],
                ["enrollment", enrollment],
                ["parents", parents],
                ["prerequisites", prerequisites],
                ["sources", sources],
                ["notes", notes],
                ["quizzes", quizzes],
                ["addAllFromSources", addAllFromSources],
                ["addAllFromNotes", addAllFromNotes],
            ].map(([field, value]) => ({ field, value })),
            "course"
        );

        const permissions = validator.validatePermissions(perm, true);

        if (!validator.isValid) {
            return NextResponse.json(
                {
                    message: "Invalid course data",
                    errors: validator.errors,
                },
                { status: 400 }
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
                .insertInto("courses_hierarchy")
                .values([
                    ...parents.map((p) => ({
                        inferior: courseId,
                        superior: p,
                        relationship: "encompasses",
                    })),
                    ...prerequisites.map((p) => ({
                        inferior: courseId,
                        superior: p,
                        relationship: "prerequisite",
                        averageLevelRequired: 0,
                        minimumLevelRequired: 0,
                    })),
                ])
                .execute();
        }

        if (sources.length || notes.length || quizzes.length) {
            await db
                .insertInto("resource_relations")
                .values([
                    ...sources.map((s) => ({
                        A: s,
                        B: courseId,
                        A_type: "source",
                        B_type: "course",
                        includeReference: addAllFromSources,
                        // reference: null,
                        // referenceType: "page",
                    })),
                    ...notes.map((n) => ({
                        A: n,
                        B: courseId,
                        A_type: "note",
                        B_type: "course",
                        includeReference: addAllFromNotes,
                        // reference: null,
                        // referenceType: "page",
                    })),
                    ...quizzes.map((q) => ({
                        A: q,
                        B: courseId,
                        A_type: "quiz",
                        B_type: "course",
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
            { status: 201 }
        );
    } catch (error) {
        if (courseId) {
            await db.deleteFrom("courses").where("id", "=", courseId).execute();
        }

        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}