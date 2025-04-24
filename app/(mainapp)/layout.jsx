import { Header, Footer } from "@server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";

export default async function RootLayout({ children }) {
    const user = await useUser({
        token: (await cookies()).get("token")?.value,
        select: ["username", "avatar", "email", "role"],
    });

    return (
        <>
            <Header user={user} />
            {children}
            <Footer />
        </>
    );
}
