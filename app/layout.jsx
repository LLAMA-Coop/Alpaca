import { getGroups, getPermittedResources } from "@/lib/db/helpers";
import { FillStore, Timer, Alerts, ThemeSetter } from "@client";
import { Inter, Sofia_Sans } from "next/font/google";
import { metadatas } from "@/lib/metadatas";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import "./globals.css";

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
        select: ["id", "username", "displayName", "avatar", "settings"],
        withAssociates: true,
        withNotifications: true,
    });

    const { sources, notes, quizzes, courses } = await getPermittedResources({
        userId: user?.id,
        takeAll: true,
    });

    const groups = await getGroups(user?.id);

    return (
        <html lang="en" className={`${inter.variable} ${sofia.variable}`}>
            {user && (
                <FillStore
                    user={user}
                    sources={sources}
                    notes={notes}
                    quizzes={quizzes}
                    courses={courses}
                    groups={groups}
                    associates={user.associates}
                    notifications={user.notifications || []}
                />
            )}

            <ThemeSetter settings={user?.settings} />

            <body>
                {/* So Firefox displays page after css has loaded */}
                <script>0</script>

                {children}

                <Timer />
                <Alerts />
            </body>
        </html>
    );
}
