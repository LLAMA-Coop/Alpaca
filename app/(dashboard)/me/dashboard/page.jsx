import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { getUserStreak, getRecentActivity, getPermittedResources } from "@/lib/db/helpers";
import { PersonalDashboard } from "@client";

export default async function DashboardPage() {
    const token = (await cookies()).get("token")?.value;
    const user = await useUser({
        token,
        select: ["id"],
    });

    if (!user) return redirect("/login?next=/me/dashboard");

    // Fetch user's enrolled courses
    const resources = await getPermittedResources({
        userId: user.id,
        withCourses: true,
    });

    // Fetch streak data
    const streak = await getUserStreak(user.id);

    // Fetch recent activity
    const recentActivityRaw = await getRecentActivity(user.id, 10);

    // Format recent activity for display
    const recentActivity = recentActivityRaw.map((activity) => ({
        type: activity.resourceType?.toUpperCase() || "UNKNOWN",
        title: `Accessed ${activity.resourceType}`,
        time: activity.lastAccessedAt ? new Date(activity.lastAccessedAt).toLocaleDateString() : "Today",
    }));

    return (
        <PersonalDashboard
            courses={resources.courses || []}
            recentActivity={recentActivity}
            streak={streak.currentStreak}
            longestStreak={streak.longestStreak}
        />
    );
}
