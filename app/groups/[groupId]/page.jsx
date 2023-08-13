import { UserCard } from "@components/client";
import styles from "@/app/Page.module.css";
import { redirect } from "next/navigation";
import { serializeOne } from "@/lib/db";
import { useUser } from "@/lib/auth";
import Group from "@models/Group";

export default async function GroupPage({ params }) {
    const groupId = params.groupId;

    const group = await Group.findById(groupId).populate("users");
    if (!group) return redirect("/groups");

    const user = serializeOne(await useUser());
    if (!group.isPublic && !user?.groups?.includes(groupId)) {
        return redirect("/groups");
    }

    return (
        <main className={styles.main}>
            <h2>{group.name}</h2>

            <section>
                <h3>Members</h3>

                {group.users.length > 0 && (
                    <ol className={styles.listGrid}>
                        {group.users.map((user) => (
                            <li key={user.id}>
                                <UserCard user={user} />
                            </li>
                        ))}
                    </ol>
                )}
            </section>
        </main>
    );
}
