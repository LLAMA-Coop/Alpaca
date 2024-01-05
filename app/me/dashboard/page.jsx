import { redirect } from "next/navigation";
import { Dashboard } from "./Dashboard";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";

export default async function DashboardPage() {
    const user = await useUser({ token: cookies().get("token")?.value });
    if (!user) return redirect("/login");

    return <Dashboard />;
}
