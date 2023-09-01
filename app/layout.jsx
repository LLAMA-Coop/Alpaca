import { Header, Footer } from "@components/server";
import { Inter } from "next/font/google";
import "./globals.css";
import connectDB from "./api/db";
connectDB();
import { Source, Note, Quiz } from "@mneme_app/database-models";
import { FillStore } from "./components/fillStore";
import { serialize } from "@/lib/db";
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

    return (
        <html lang="en">
            <FillStore sourceStore={sources} noteStore={notes} quizStore={quizzes} />
            <body className={inter.className}>
                <Header />
                {children}
                <Footer />
            </body>
        </html>
    );
}
