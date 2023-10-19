import { Header, Footer } from "@components/server";
import DatabaseConnectError from "./components/error/database-connect";
import { Inter } from "next/font/google";
import "./globals.css";
import connectDB from "./api/db";
// import { Source, Note, Quiz, Group, User } from "@mneme_app/database-models";
import { Source, Note, Quiz, Group, User } from "@/app/api/models";
import { FillStore } from "./components/fillStore";
import { serialize, serializeOne } from "@/lib/db";
import { useUser, queryReadableResources } from "@/lib/auth";
import { cookies } from "next/headers";
import NotFound from "./not-found";

const connection = await connectDB();

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Mneme",
    description: "Learning App",
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
        await user.populate({
            path: "notifications",
            populate: { path: "from.user", model: "user" },
        });
        // await user.populate("notifications.from.group");
        // await user.populate("notifications.from.admin");
        await user.populate("associates");
    }

    const notifications = user
        ? user.notifications.map((x) => {
              const notification = {
                  _id: x._id,
                  from: {},
                  subject: x.subject,
                  message: x.message,
                  responseActions: x.responseActions,
              };

              if (x.from.user) {
                  notification.from.user = {
                      _id: x.from.user._id,
                      username: x.from.user.username,
                      displayName: x.from.user.displayName,
                  };
              }

              if (x.from.admin) {
                  notification.from.admin = {
                      _id: x.from.admin._id,
                      username: x.from.admin.username,
                      displayName: x.from.admin.displayName,
                  };
              }

              if (x.from.group) {
                  notification.from.group = {
                      _id: x.from.group._id,
                      name: x.from.group.name,
                      description: x.from.group.description,
                  };
              }

              return notification;
          })
        : [];

    const query = queryReadableResources(user);
    const sources = serialize(await Source.find(query));
    const notes = serialize(await Note.find(query));
    const quizzes = serialize(await Quiz.find(query));

    const publicUsers = await User.find({ isPublic: true });
    const associates = user
        ? user.associates.filter((a) => !publicUsers.includes(a))
        : [];
    const availableUsers = serialize([...associates, ...publicUsers]).map(
        (x) => ({
            _id: x._id,
            username: x.username,
            displayName: x.displayName,
            avatar: x.avatar,
        }),
    );
    const publicGroups = await Group.find({ isPublic: true });
    const availableGroups = serialize(
        user?.hasOwnProperty() && user?.groups.length > 0
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
                notifications={serialize(notifications)}
                webSocketURL={process.env.WS_URL}
            />
            <body className={inter.className}>
                <Header />
                {children}
                <Footer />
            </body>
        </html>
    );
}
