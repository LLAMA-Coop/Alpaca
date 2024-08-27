import { redirect } from "next/navigation";
import styles from "@/app/page.module.css";
import { cookies } from "next/headers";
import { NoteDisplay } from "@/app/components/server";
import { useUser } from "@/lib/auth";
import { getPermittedNotes } from "@/lib/db/helpers";
import { NoteInput } from "@/app/components/client";

export default async function NotePage({ params }) {
    const { id } = params;

    const user = await useUser({ token: cookies().get("token")?.value });
    const note = (await getPermittedNotes(user.id)).find((x) => x.id === id);
    if (!note) {
        return redirect("/notes");
    }

    return (
        <main className={styles.main}>
            <section>
                <NoteDisplay note={note} />
            </section>
            {note.permissionType === "write" && (
                <section>
                    <NoteInput note={note} />
                </section>
            )}
        </main>
    );
}
