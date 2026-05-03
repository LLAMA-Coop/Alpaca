import { db } from "@/lib/db/db";
import { NextResponse } from "next/server";

// GET PUBLIC COURSES
export async function GET(req) {
    try {
        // Get the limit from query params, default to 50 for homepage display
        const url = new URL(req.url);
        const limit = parseInt(url.searchParams.get("limit") || "50");
        const offset = parseInt(url.searchParams.get("offset") || "0");

        const courses = await db
            .selectFrom("courses")
            .select([
                "id",
                "public_id",
                "name",
                "description",
                "enrollment",
                "created_by",
                "created_at",
            ])
            .where("enrollment", "=", "open")
            .where("is_deleted", "=", 0)
            .orderBy("created_at", "desc")
            .limit(limit)
            .offset(offset)
            .execute();

        if (!courses || courses.length === 0) {
            console.log("No public courses found");
            return NextResponse.json([]);
        }

        // Enrich with enrollment count and resource count
        const enrichedCourses = await Promise.all(
            courses.map(async (course) => {
                try {
                    const enrollmentCount = await db
                        .selectFrom("course_users")
                        .select(db.fn.count("user_id").as("count"))
                        .where("course_id", "=", course.id)
                        .executeTakeFirst();

                    const resourceCount = await db
                        .selectFrom("resource_relations")
                        .select(db.fn.count("A").as("count"))
                        .where((eb) =>
                            eb.or([
                                eb.and([
                                    eb("A", "=", course.id),
                                    eb("A_type", "=", "course"),
                                    eb("B_type", "in", ["source", "note", "quiz"]),
                                ]),
                                eb.and([
                                    eb("B", "=", course.id),
                                    eb("B_type", "=", "course"),
                                    eb("A_type", "in", ["source", "note", "quiz"]),
                                ]),
                            ])
                        )
                        .executeTakeFirst();

                    return {
                        ...course,
                        enrollments: enrollmentCount?.count || 0,
                        resources: resourceCount?.count || 0,
                    };
                } catch (err) {
                    console.error(`Error enriching course ${course.id}:`, err);
                    return {
                        ...course,
                        enrollments: 0,
                        resources: 0,
                    };
                }
            })
        );

        return NextResponse.json(enrichedCourses);
    } catch (error) {
        console.error("Failed to fetch public courses:", error);
        return NextResponse.json(
            { message: "Failed to fetch public courses", error: error.message },
            { status: 500 }
        );
    }
}
