import { Card, GroupInput } from "@client";
import styles from "@/app/page.module.css";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { Group } from "@models";

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
                  { admins: { $in: [user._id] } },
              ],
          })
        : [];

    return (
        <main className={styles.main}>
            <div className={styles.titleBlock}>
                <h2>Groups</h2>

                <p>
                    A group is a collection of users who can share resources,
                    notes and quizzes with each other.
                    <br />
                    {user
                        ? `These are the groups that are publicly viewable, as well as the ones you are in.`
                        : `You are only viewing the publicly available groups.
                            Log in to see groups available to you and create your own groups.`}
                </p>
            </div>

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
                <h3>Create Group</h3>
                <GroupInput />
            </section>
        </main>
    );
}
