import { Card, GroupDisplay, MasoneryList } from "@client";
import { getGroups } from "@/lib/db/helpers";
import styles from "@main/page.module.css";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import Link from "next/link";

export default async function GroupsPage() {
    const user = await useUser({ token: (await cookies()).get("token")?.value });

    const groups = (await getGroups(user?.id, true)).map((g) => {
        const owner = g.members.find((m) => m.role === "owner");
        return {
            ...g,
            creator: owner,
        };
    });

    const mine = groups.filter((g) => g.members.find((m) => m.id === user?.id));
    const discover = groups.filter((g) => !mine.find((a) => a.id === g.id));

    return (
        <main className={styles.main}>
            <header>
                <h1>Groups</h1>

                <p>
                    A group is a collection of users who can share resources, notes and quizzes with
                    each other.
                    <br />
                    {user
                        ? `These are the groups that are publicly viewable, as well as the ones you are in.`
                        : `You are only viewing the publicly available groups.
                            Log in to see groups available to you and create your own groups.`}
                </p>

                <Link
                    className="button primary round"
                    href="/groups/new"
                >
                    Create a new group
                </Link>
            </header>

            <section>
                <h2>Discover Groups</h2>

                {!!discover.length ? (
                    <MasoneryList>
                        {discover.map((group) => (
                            <li key={group.id}>
                                <GroupDisplay group={group} />
                            </li>
                        ))}
                    </MasoneryList>
                ) : (
                    <div className="paragraph">
                        <p>There are no groups to discover yet.</p>
                    </div>
                )}
            </section>

            {user && (
                <section>
                    <h2>Your Groups</h2>

                    {!!mine.length ? (
                        <MasoneryList>
                            {mine.map((group) => (
                                <li key={group.id}>
                                    <GroupDisplay group={group} />
                                </li>
                            ))}
                        </MasoneryList>
                    ) : (
                        <div className="paragraph">
                            <p>You are not listed in any groups yet.</p>
                        </div>
                    )}
                </section>
            )}
        </main>
    );
}
