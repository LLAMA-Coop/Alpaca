import {
  trackUserProgress,
  getUserCourseProgress,
  getUserStreak,
  updateUserStreak,
  getRecentActivity,
} from "@/lib/db/helpers";
import { isValidId } from "@/lib/random";
import { catchRouteError } from "@/lib/db/helpers";

export async function POST(request, { params }) {
  try {
    const { userId, resourceId, resourceType, courseId, isCompleted, timeSpent } =
      await request.json();

    if (!isValidId(userId) || !isValidId(resourceId)) {
      return Response.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    // Track the progress (courseId is optional)
    const tracked = await trackUserProgress({
      userId,
      resourceId,
      resourceType,
      courseId: isValidId(courseId) ? courseId : null,
      isCompleted: isCompleted || false,
      timeSpent: timeSpent || 0,
    });

    // Update streak if resource was completed
    if (isCompleted) {
      await updateUserStreak(userId);
    }

    if (!tracked) {
      return Response.json(
        { error: "Failed to track progress" },
        { status: 500 }
      );
    }

    return Response.json(
      { success: true, message: "Progress tracked successfully" },
      { status: 200 }
    );
  } catch (error) {
    catchRouteError({ error, route: "POST /api/progress" });
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const courseId = url.searchParams.get("courseId");
    const type = url.searchParams.get("type");

    if (!isValidId(userId)) {
      return Response.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    let data = {};

    if (type === "course" && isValidId(courseId)) {
      data = await getUserCourseProgress(userId, courseId);
    } else if (type === "streak") {
      data = await getUserStreak(userId);
    } else if (type === "activity") {
      const limit = parseInt(url.searchParams.get("limit")) || 10;
      data = await getRecentActivity(userId, limit);
    } else {
      return Response.json(
        { error: "Invalid type parameter" },
        { status: 400 }
      );
    }

    return Response.json(data, { status: 200 });
  } catch (error) {
    catchRouteError({ error, route: "GET /api/progress" });
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
