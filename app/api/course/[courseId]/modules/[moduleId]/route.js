import { db } from "@/lib/db/db";
import { catchRouteError } from "@/lib/db/helpers";
import { isValidId } from "@/lib/validation";

export async function PATCH(request, { params }) {
  try {
    const { courseId, moduleId } = params;
    const { title, description } = await request.json();

    if (!isValidId(courseId) || !isValidId(moduleId) || !title) {
      return Response.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    const updated = await db
      .updateTable("course_modules")
      .set({
        title,
        description,
        updated_at: new Date(),
      })
      .where("id", "=", parseInt(moduleId))
      .where("course_id", "=", parseInt(courseId))
      .returningAll()
      .executeTakeFirst();

    if (!updated) {
      return Response.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    return Response.json(updated);
  } catch (error) {
    catchRouteError({ error, route: "PATCH /api/course/[courseId]/modules/[moduleId]" });
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { courseId, moduleId } = params;

    if (!isValidId(courseId) || !isValidId(moduleId)) {
      return Response.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    // Delete module and cascade delete related records
    await db
      .deleteFrom("course_modules")
      .where("id", "=", parseInt(moduleId))
      .where("course_id", "=", parseInt(courseId))
      .execute();

    return Response.json(
      { success: true, message: "Module deleted" },
      { status: 200 }
    );
  } catch (error) {
    catchRouteError({ error, route: "DELETE /api/course/[courseId]/modules/[moduleId]" });
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
