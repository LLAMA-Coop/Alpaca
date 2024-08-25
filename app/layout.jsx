import { FillStore, Timer, Alerts, Modals, Menu } from "@client";
import { Header, Footer, DBConnectError } from "@server";
import { metadatas } from "@/lib/metadatas";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import "./globals.css";
import { getPermittedCourses, getPermittedResources } from "@/lib/db/helpers";

// const connection = await connectDB();

export const metadata = {
    metadataBase: new URL(metadatas.layout.url),
    title: metadatas.layout.title,
    description: metadatas.layout.description,
    keywords: metadatas.layout.keywords.join(", "),
    openGraph: {
        title: metadatas.layout.title,
        description: metadatas.layout.description,
        url: metadatas.layout.url,
        type: "website",
        siteName: metadatas.layout.title,
        locale: "en_US",
        images: metadatas.layout.images,
    },
};

export default async function RootLayout({ children }) {
    const user = await useUser({
        token: cookies().get("token")?.value,
        select: ["id", "username", "displayName", "avatar"],
        takeAssociates: true,
        takeCourses: true,
        takeNotifications: true,
    });

    const permittedResources = await getPermittedResources(user?.id);
    const { sources, notes, quizzes } = permittedResources;
    const courses = await getPermittedCourses(user?.id);

    return (
        <html lang="en">
            {user && (
                <FillStore
                    user={user}
                    sources={sources}
                    notes={notes}
                    quizzes={quizzes}
                    courses={courses}
                    groups={user.groups}
                    associates={user.associates}
                    notifications={user.notifications}
                    // webSocketURL={process.env.WS_URL}
                />
            )}

            <body>
                <Header user={user} />
                {children}
                <Footer />

                {/* Layers */}
                <Timer />
                <Alerts />
                <Modals />
                <Menu />
            </body>
        </html>
    );
}
