import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { Header } from "@server";

export default async function RootLayout({ children }) {
    const user = await useUser({
        token: (await cookies()).get("token")?.value,
        select: ["username", "avatar", "email", "role"],
    });

    if (!user) redirect("/login");

    return (
        <>
            <Header user={user} />
            {children}
        </>
    );
}
