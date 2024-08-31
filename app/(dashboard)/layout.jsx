import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { Header } from "@server";

export default async function RootLayout({ children }) {
    const user = await useUser({
        token: cookies().get("token")?.value,
        select: ["username", "avatar"],
    });

    return (
        <>
            <Header user={user} />
            {children}
        </>
    );
}
