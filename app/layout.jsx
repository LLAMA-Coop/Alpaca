import { Header, Footer } from "@components/server";
import DatabaseConnectError from "./components/error/database-connect";
import { Inter } from "next/font/google";
import "./globals.css";
import connectDB from "./api/db";
// import { Source, Note, Quiz, Group, User } from "@mneme_app/database-models";
import {
    Source,
    Note,
    Quiz,
    Group,
    User,
    Notification,
} from "@/app/api/models";
import Course from "./api/models/Course";
import { FillStore } from "./components/fillStore";
import { serialize, serializeOne } from "@/lib/db";
import { Source, Note, Quiz, Group, User, Notification } from "@models";
import { useUser, queryReadableResources } from "@/lib/auth";
import { Header, Footer, DBConnectError } from "@server";
import { serialize, serializeOne } from "@/lib/db";
import { metadatas } from "@/lib/metadatas";
import { FillStore, Timer } from "@client";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import connectDB from "./api/db";
import "./globals.css";
import { Alerts } from "./components/Layers/Alerts";
import { Modals } from "./components/Modals/Modals";

const connection = await connectDB();

const inter = Inter({ subsets: ["latin"] });

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
    if (connection === false) {
        return (
            <html lang="en">
                <body className={inter.className}>
                    <Header />
                    <DBConnectError />
                    <Footer />
                </body>
            </html>
        );
    }
    const user = await useUser({ token: cookies().get("token")?.value });
    if (user) {
        await user.populate("associates");
        await user.populate("groups");
    }

    const notifications = user
        ? serialize(
              await Notification.find({ recipient: user._id })
                  .populate("senderUser")
                  .populate("senderGroup"),
          )
        : [];

    const query = queryReadableResources(user);
    const sources = serialize(await Source.find(query));
    const notes = serialize(await Note.find(query));
    const quizzes = serialize(await Quiz.find(query));
    const courses = serialize(await Course.find(query));

    const publicUsers = await User.find({ isPublic: true });
    const associates = user
        ? user.associates.filter((a) => !publicUsers.includes(a))
        : [];
    const availableUsers = serialize([
        ...associates.filter((x) => !x.isPublic),
        ...publicUsers,
    ]).map((x) => ({
        _id: x._id,
        username: x.username,
        displayName: x.displayName,
        avatar: x.avatar,
    }));
    const publicGroups = await Group.find({ isPublic: true });
    const availableGroups = serialize(
        user && user.groups
            ? [...user.groups, ...publicGroups]
            : [...publicGroups],
    );

    return (
        <html lang="en">
            <FillStore
                sourceStore={sources}
                noteStore={notes}
                quizStore={quizzes}
                courseStore={courses}
                groupStore={availableGroups}
                userStore={availableUsers}
                user={serializeOne(user)}
                notifications={notifications}
                webSocketURL={process.env.WS_URL}
            />

            <body className={inter.className}>
                <Header />
                {children}
                <Footer />

                <Timer />
                <Alerts />
                <Modals />
            </body>
        </html>
    );
}
