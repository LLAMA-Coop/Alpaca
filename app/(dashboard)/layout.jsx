import { Header, Footer } from "@server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";

export default async function RootLayout({ children }) {
    const user = await useUser({
        token: (await cookies()).get("token")?.value,
        select: ["username", "displayName", "avatar", "email", "role"],
    });

    if (!user) redirect("/login");

    return (
        <div className="appShell">
            <Header user={user} />
            <div className="appViewport">
                <main className="appMain">{children}</main>
                <Footer />
            </div>
        </div>
    );
}
