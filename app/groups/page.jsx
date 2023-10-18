import styles from "@/app/page.module.css";
import { Card, GroupInput } from "@components/client";
// import Group from "@models/Group";
// import { Group } from "@mneme_app/database-models";
import { Group } from "@/app/api/models";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";

export default async function GroupPage() {
    const groups = await Group.find({
        isPublic: true,
    });

    const user = await useUser({ token: cookies().get("token")?.value });
    const yourGroups = user
        ? await Group.find({
              $or: [
                  { owner: user._id },
                  { users: { $in: [user._id] } },
                  { admins: { $in: [user.id] } },
              ],
          })
        : [];

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

            <section>
                <h3>Your Groups</h3>

                {yourGroups.length > 0 ? (
                    <ol className={styles.listGrid}>
                        {yourGroups.map((group) => (
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
                        <p>You are not listed in any groups yet.</p>
                    </div>
                )}
            </section>

            <section>
                <h3>Add Group</h3>
                <GroupInput />
            </section>
        </main>
    );
}
