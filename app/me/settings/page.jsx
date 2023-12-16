import { redirect } from "next/navigation";
import { serializeOne } from "@/lib/db";
import { cookies } from "next/headers";
import { Settings } from "./Settings";
import { useUser } from "@/lib/auth";

export default async function SettingsPage() {
    const user = await useUser({ token: cookies().get("token")?.value });
    if (!user) return redirect("/login");

    return <Settings user={serializeOne(user)} />;
}
