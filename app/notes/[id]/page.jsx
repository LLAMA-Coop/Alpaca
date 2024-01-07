import { redirect } from "next/navigation";
import styles from "@/app/page.module.css";
import { Note } from "@/app/api/models";
import { cookies } from "next/headers";
import { NoteDisplay } from "@/app/components/server";
import { canRead, useUser } from "@/lib/auth";

export default async function NotePage({ params }) {
    const { id } = params;

    const note = await Note.findById(id);

    const user = await useUser({ token: cookies().get("token")?.value });
    if (!canRead(note, user)) {
        return redirect("/notes");
    }

    return (
        <main className={styles.main}>
            <NoteDisplay note={note} />
        </main>
    );
}
