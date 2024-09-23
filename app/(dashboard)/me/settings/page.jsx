import { redirect } from "next/navigation";
import { serializeOne } from "@/lib/db";
import { Settings } from "./Settings";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";

export default async function SettingsPage() {
    const user = await useUser({
        token: cookies().get("token")?.value,
        select: [
            "id",
            "username",
            "displayName",
            "email",
            "avatar",
            "description",
            "createdAt",
        ],
    });

    if (!user) return redirect("/login");

    return <Settings user={serializeOne(user)} />;
}
