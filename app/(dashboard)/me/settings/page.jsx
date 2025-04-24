import { redirect } from "next/navigation";
import { serializeOne } from "@/lib/db";
import { cookies } from "next/headers";
import { Settings } from "./Settings";
import { useUser } from "@/lib/auth";

export default async function SettingsPage() {
    const token = (await cookies()).get("token")?.value;

    const user = await useUser({
        token,
        select: [
            "id",
            "username",
            "displayName",
            "email",
            "emailVerified",
            "avatar",
            "description",
            "createdAt",
            "settings",
            "twoFactorEnabled",
            "twoFactorRecovery",
            "tokens",
        ],
    });

    if (!user) return redirect("/login?next=/me/settings");

    user.sessions = user.tokens.map((t) => {
        const isCurrent = t.token === token;

        return {
            ...t,
            isCurrent,
            token: undefined,
        };
    });

    user.tokens = undefined;

    return <Settings user={serializeOne(user)} />;
}
