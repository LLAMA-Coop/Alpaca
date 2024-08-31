import { unauthorized, server } from "@/lib/apiErrorResponses";
import SubmitErrors from "@/lib/SubmitErrors";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { MAX } from "@/lib/constants";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";
import {
    getPermittedCourses,
    insertPermissions,
    catchRouteError,
    updateCourse,
    addError,
    getNanoId,
} from "@/lib/db/helpers";
import { Validator } from "@/lib/validation";

export async function GET(req) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const content = await getPermittedCourses(user.id);

        return NextResponse.json(
            {
                content,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}

export async function POST(req) {
    const publicId = getNanoId();

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const validator = new Validator();

        const {
            name,
            description,
            enrollment,
            parentCourses,
            prerequisites,
            sources,
            notes,
            quizzes,
            addAllFromSources,
            addAllFromNotes,
            permissions,
        } = await req.json();

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
            ],
            "course",
        );

        if (!validator.isValid) {
            return NextResponse.json(
                {
                    message: "Invalid input, please check the errors",
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

                allRead: permissions.allRead,
                allWrite: permissions.allWrite,

                read: JSON.stringify(permissions.read),
                write: JSON.stringify(permissions.write),
            })
            .execute();

        const hierQuery = `INSERT INTO \`CourseHierarchy\` 
            (\`inferiorCourse\`, \`superiorCourse\`, \`relationship\`, \`averageLevelRequired\`)
            VALUES ?`;

        const hierarchyValues = [
            ...parentCourses.map((c) => ({
                inferior: publicId,
                superior: c.id,
                relationship: "encompasses",
            })),
            ...prerequisites.map((c) => ({
                inferior: publicId,
                superior: c.id,
                relationship: "prerequisite",
                averageLevelRequired: c.requiredAverageLevel,
            })),
        ];

        if (hierarchyValues.length > 0) {
            await db
                .insertInto("courses_hierarchy")
                .values(hierarchyValues)
                .execute();
        }

        const crsResrcQuery = `INSERT INTO \`CourseResources\` 
            (\`courseId\`, \`resourceId\`, \`resourceType\`, \`includeReferencingResources\`)
            VALUES ?`;

        const crsResrcValues = [];
        sources.forEach((s) => {
            crsResrcValues.push([courseId, s, "source", addAllFromSources]);
        });
        notes.forEach((n) => {
            crsResrcValues.push([courseId, n, "note", addAllFromNotes]);
        });
        quizzes.forEach((q) => {
            crsResrcValues.push([courseId, q, "quiz", false]);
        });

        const [crsResrcInserts, fieldsCrsResrc] = await db
            .promise()
            .query(crsResrcQuery, [crsResrcValues]);

        const content = courseInsert;

        return NextResponse.json(
            {
                message: "Course created successfully",
                content,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error(`[Course] POST error: ${error}`);
        addError(error, "/api/course: POST");
        return server;
    }
}

export async function PUT(req) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const {
            id,
            name,
            description,
            enrollment,
            parentCourses,
            prerequisites,
            sources,
            notes,
            quizzes,
            addAllFromSources,
            addAllFromNotes,
            permissions,
        } = await req.json();

        const course = (await getPermittedCourses(user.id)).find(
            (x) => x.id === id,
        );
        if (!course) {
            return NextResponse.json(
                {
                    message: `No course found with id ${id}`,
                },
                { status: 404 },
            );
        }

        const isCreator =
            (course.createdBy && course.createdBy === user.id) ||
            (course.creator && course.creator.id === user.id);
        const canEdit = isCreator || course.permissionType === "write";

        if (!canEdit) {
            return NextResponse.json(
                {
                    message: `You are not permitted to edit course ${id}`,
                },
                { status: 403 },
            );
        }

        if (name) {
            course.name = name.trim();
        }
        if (description) {
            course.description = description;
        }

        const content = await updateCourse({
            id,
            name,
            description,
            enrollment,
            parentCourses,
            prerequisites,
            sources,
            notes,
            quizzes,
            addAllFromSources,
            addAllFromNotes,
            permissions: isCreator ? permissions : [],
            contributorId: user.id,
        });

        return NextResponse.json({ content });
    } catch (error) {
        console.error(`[Course] PUT error: ${error}`);
        addError(error, "/api/course: PUT");
        return server;
    }
}
