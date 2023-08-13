import styles from "@/app/Page.module.css";
import { Card } from "@components/client";
import Group from "@models/Group";

export default async function GroupPage() {
    const groups = await Group.find({
        isPublic: true,
    });

    return (
        <main className={styles.main}>
            <h2>Groups</h2>

            <section>
                <h3>Discover Groups</h3>

                {groups.length > 0 ? (
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
                ) : (
                    <div className="paragraph">
                        <p>There are no groups to discover yet.</p>
                    </div>
                )}
            </section>
        </main>
    );
}
