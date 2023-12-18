import { redirect } from "next/navigation";
import { Dashboard } from "./Dashboard";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { Course } from "@models";

export default async function DashboardPage() {
    const user = await useUser({ token: cookies().get("token")?.value });
    if (!user) return redirect("/login");
    user.populate("associates");
    user.populate("groups");

    console.log("Thats the user dawg " + user);

    const courses = await Course.find();

    return (
        <Dashboard
            user={JSON.parse(JSON.stringify(user))}
            courses={JSON.parse(JSON.stringify(courses)) || []}
            groups={JSON.parse(JSON.stringify(user.groups)) || []}
            associates={JSON.parse(JSON.stringify(user.associates)) || []}
        />
    );
}
