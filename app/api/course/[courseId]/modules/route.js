import { db } from "@/lib/db/db";
import { catchRouteError } from "@/lib/db/helpers";
import { isValidId } from "@/lib/validation";

export async function GET(request, { params }) {
  try {
    const courseId = params.courseId;

    if (!isValidId(courseId)) {
      return Response.json(
        { error: "Invalid course ID" },
        { status: 400 }
      );
    }

    const modules = await db
      .selectFrom("course_modules")
      .selectAll()
      .where("course_id", "=", parseInt(courseId))
      .orderBy("order_index", "asc")
      .execute();

    return Response.json({
      modules: modules || [],
    });
  } catch (error) {
    catchRouteError({ error, route: "GET /api/course/[courseId]/modules" });
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const courseId = params.courseId;
    const { title, description, orderIndex } = await request.json();

    if (!isValidId(courseId) || !title) {
      return Response.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    const module = await db
      .insertInto("course_modules")
      .values({
        course_id: parseInt(courseId),
        title,
        description,
        order_index: orderIndex || 0,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return Response.json(module, { status: 201 });
  } catch (error) {
    catchRouteError({ error, route: "POST /api/course/[courseId]/modules" });
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
