import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import {
    getUserStreak,
    getUserXP,
    getTodayStudySeconds,
    getLeaderboard,
    getStreakCalendar,
    getUserCourseProgress,
    getPermittedResources,
} from "@/lib/db/helpers";
import { PersonalDashboard } from "@client";
import shuffleQuizzes from "@/lib/shuffleQuizzes";

export default async function DashboardPage() {
    const token = (await cookies()).get("token")?.value;
    const user = await useUser({
        token,
        select: ["id", "username", "displayName", "avatar"],
    });

    if (!user) return redirect("/login?next=/me/dashboard");

    const resources = await getPermittedResources({
        userId: user.id,
        withCourses: true,
        withQuizzes: true,
    });

    const courses = resources.courses || [];
    const dueQuizzes = shuffleQuizzes(resources.quizzes || []).slice(0, 5);

    const [streak, xp, todaySeconds, leaderboard, calendar, courseProgress] = await Promise.all([
        getUserStreak(user.id),
        getUserXP(user.id),
        getTodayStudySeconds(user.id),
        getLeaderboard({ limit: 5 }),
        getStreakCalendar(user.id, 7),
        Promise.all(
            courses.slice(0, 3).map((course) => getUserCourseProgress(user.id, course.id))
        ),
    ]);

    const progressMap = {};
    courses.slice(0, 3).forEach((course, index) => {
        progressMap[course.id] = courseProgress[index];
    });

    return (
        <PersonalDashboard
            user={user}
            streak={streak}
            xp={xp}
            todaySeconds={todaySeconds}
            leaderboard={leaderboard}
            calendar={calendar}
            courses={courses}
            progressMap={progressMap}
            dueQuizzes={dueQuizzes}
        />
    );
}

