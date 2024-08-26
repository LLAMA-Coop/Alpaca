import { NextResponse } from "next/server";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { unauthorized, server } from "@/lib/apiErrorResponses";
import { MAX } from "@/lib/constants";
import SubmitErrors from "@/lib/SubmitErrors";
import {
    addError,
    getPermittedCourses,
    insertPermissions,
    updateCourse,
} from "@/lib/db/helpers";
import { db } from "@/lib/db/db";

export async function GET(req) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });

        const content = await getPermittedCourses(user?.id);
        return NextResponse.json({
            content,
        });
    } catch (error) {
        console.error(`[Course] GET error: ${error}`);
        addError(error, "/api/course: GET");
        return server;
    }
}

export async function POST(req) {
    const baseQuery = `INSERT INTO \`Courses\`
        (\`name\`, \`description\`, \`enrollment\`, \`createdBy\`) 
        VALUES (?, ?, ?, ?)`;

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const submitErrors = new SubmitErrors();

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

        if (!name) {
            submitErrors.addError("Missing name");
        } else if (name.length > MAX.name) {
            submitErrors.addError(
                `The following name is longer than the maximum permitted, which is ${MAX.name} characters:\n ${name}`,
            );
        }

        if (!description) {
            submitErrors.addError("Missing description");
        } else if (description.length > MAX.description) {
            submitErrors.addError(
                `The following description is longer than the maximum permitted, which is ${MAX.description} characters:\n ${description}`,
            );
        }

        if (submitErrors.cannotSend) {
            return NextResponse.json(
                {
                    message: submitErrors.displayErrors(),
                },
                { status: 400 },
            );
        }

        const fieldsArray = [name, description, enrollment, user.id];

        const [courseInsert, fields] = await db
            .promise()
            .query(baseQuery, fieldsArray);

        const courseId = courseInsert.insertId;

        const permsInsert = await insertPermissions(
            permissions,
            courseId,
            user.id,
        );

        const hierQuery = `INSERT INTO \`CourseHierarchy\` 
            (\`inferiorCourse\`, \`superiorCourse\`, \`relationship\`, \`averageLevelRequired\`)
            VALUES ?`;

        const hierValues = [];
        parentCourses.forEach((crs) => {
            hierValues.push([courseId, crs, "encompasses", 0]);
        });
        prerequisites.forEach((crs) => {
            hierValues.push([
                courseId,
                crs.course,
                "prerequisite",
                crs.requiredAverageLevel,
            ]);
        });

        const [hierInserts, fieldsHier] =
            hierValues.length > 0
                ? await db.promise().query(hierQuery, [hierValues])
                : [[], undefined];

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
