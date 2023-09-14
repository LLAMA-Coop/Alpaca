import { Header, Footer } from "@components/server";
import { Inter } from "next/font/google";
import "./globals.css";
import connectDB from "./api/db";
connectDB();
import { Source, Note, Quiz, Group, User } from "@mneme_app/database-models";
import { FillStore } from "./components/fillStore";
import { serialize, serializeOne } from "@/lib/db";
import { useUser, queryReadableResources } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Mneme",
    description: "Learning App",
};

export default async function RootLayout({ children }) {
    const user = await useUser();

    const query = queryReadableResources(user);
    const sources = serialize(await Source.find(query));
    const notes = serialize(await Note.find(query));
    const quizzes = serialize(await Quiz.find(query));

    const publicUsers = await User.find({ isPublic: true });
    const availableUsers = serialize(
        user?.hasOwnProperty("associates") && user?.associates.length > 0
            ? [...user.associates, ...publicUsers]
            : [...publicUsers],
    ).map(x => ({
        username: x.username,
        displayName: x.displayName,
        avatar: x.avatar,
    }));
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
