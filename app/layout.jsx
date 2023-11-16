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
import { FillStore } from "./components/fillStore";
import { serialize, serializeOne } from "@/lib/db";
import { useUser, queryReadableResources } from "@/lib/auth";
import { cookies } from "next/headers";
import { Timer } from "./components/Layers/Timer";

const connection = await connectDB();

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Mneme",
    description:
        "Quizzes you can customize, information traces back to its source",
};

export default async function RootLayout({ children }) {
    if (connection === false) {
        return (
            <html lang="en">
                <body className={inter.className}>
                    <Header />
                    <DatabaseConnectError />
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
            </body>
        </html>
    );
}
