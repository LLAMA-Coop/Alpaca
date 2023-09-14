import { Card, GroupInput } from "@components/client";
import styles from "@/app/page.module.css";
import { redirect } from "next/navigation";
import { useUser } from "@/lib/auth";
// import { User } from "@mneme_app/database-models";
import { User } from "@/app/api/models";

export default async function GroupsPage() {
    const user = await useUser();
    if (!user) return redirect("/login");

    const groups = (await User.findById(user.id).populate("groups")).groups;

    return (
        <main className={styles.main}>
            <h2>Groups</h2>

            {groups.length > 0 && (
                <section>
                    <h3>Your Groups</h3>

                    <ol className={styles.listGrid}>
                        {groups.map((group) => (
                            <li key={group.id}>
                                <Card
                                    title={group.name}
                                    description={group.description}
                                    url={`/groups/${group.id}`}
                                />
                            </li>
                        ))}
                    </ol>
                </section>
            )}

            <section>
                <h3>Create a Group</h3>

                <GroupInput />
            </section>
        </main>
    );
}
