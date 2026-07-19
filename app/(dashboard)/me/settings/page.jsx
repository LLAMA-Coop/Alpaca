import { redirect } from "next/navigation";
import { serializeOne } from "@/lib/db";
import { cookies } from "next/headers";
import { Settings } from "./Settings";
import { useUser } from "@/lib/auth";
import Link from "next/link";

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

    return (
        <>
            <div style={{ padding: "20px 24px 0", maxWidth: 1180, margin: "0 auto", width: "100%" }}>
                <Link href="/me/dashboard" className="link">← Back to Dashboard</Link>
            </div>
            <Settings user={serializeOne(user)} />
        </>
    );
}
