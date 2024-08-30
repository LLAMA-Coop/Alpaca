import { FillStore, Timer, Alerts, Modals, Menu } from "@client";
import { Header, Footer } from "@server";
import { metadatas } from "@/lib/metadatas";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import "./globals.css";
import {
    getUserXp,
    getPermittedCourses,
    getPermittedNotes,
    getPermittedQuizzes,
    // getPermittedResources,
    getPermittedSources,
} from "@/lib/db/helpers";
import { db } from "@/lib/db/db";

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
    const user = await useUser({ token: cookies().get("token")?.value });

    // const permittedResources = user
    //     ? await getPermittedResources(user.id)
    //     : { sources: [], notes: [], quizzes: [], notifications: [] };

    const [userQuizzes, fields] = user
        ? await db
              .promise()
              .query("SELECT * FROM `UserQuizzes` WHERE `userId` = ?", [
                  user.id,
              ])
        : [[], null];

    if (user) {
        user.quizzes = userQuizzes;
        user.xp = await getUserXp(user.id);
    }

    const [users, uFields] = await db
        .promise()
        .query("SELECT `id`, `username`, `displayName` FROM `Users`");
    const sources = await getPermittedSources(user?.id);
    const notes = await getPermittedNotes(user?.id);
    const quizzes = await getPermittedQuizzes(user?.id);
    const courses = await getPermittedCourses(user?.id);
    const notifications = user ? user.notifications : [];

    return (
        <html lang="en">
            {user && (
                <FillStore
                    user={user}
                    users={users}
                    sources={sources}
                    notes={notes}
                    quizzes={quizzes}
                    courses={courses}
                    groups={user.groups}
                    associates={user.associates}
                    notifications={notifications}
                    // webSocketURL={process.env.WS_URL}
                />
            )}

            <body>
                <Header />
                {children}
                <Footer />

                <Timer />
                <Alerts />
                <Modals />
                <Menu />
            </body>
        </html>
    );
}
