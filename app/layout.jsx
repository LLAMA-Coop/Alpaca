import { FillStore, Timer, Alerts, Modals, Menu } from "@client";
import { Header, Footer, DBConnectError } from "@server";
import { metadatas } from "@/lib/metadatas";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import "./globals.css";
import {
    getPermittedCourses,
    getPermittedNotes,
    getPermittedQuizzes,
    getPermittedResources,
    getPermittedSources,
} from "@/lib/db/helpers";
import { Inter, Sofia_Sans } from "next/font/google";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-body",
    display: "swap",
});

const sofia = Sofia_Sans({
    subsets: ["latin"],
    variable: "--font-heading",
    display: "swap",
});

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

    const sources = (await getPermittedSources(user?.id)) || [];
    const notes = (await getPermittedNotes(user?.id)) || [];
    const quizzes = (await getPermittedQuizzes(user?.id)) || [];
    const courses = (await getPermittedCourses(user?.id)) || [];
    const notifications = user ? user.notifications : [];

    return (
        <html lang="en" className={`${inter.variable} ${sofia.variable}`}>
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
                {/* So Firefox displays page after css has loaded */}
                <script>0</script>

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
