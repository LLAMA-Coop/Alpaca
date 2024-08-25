import styles from "@/app/page.module.css";
import { redirect } from "next/navigation";
import { serializeOne } from "@/lib/db";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";

export default async function UserPage({ params: { username } }) {
    const user = await useUser({
        token: cookies().get("token")?.value,
        select: ["id", "username"],
    });

    if (!user) return redirect("/login");
    const usernameDecoded = decodeURIComponent(username);
    if (user.username === usernameDecoded) return redirect("/me/dashboard");

    const profile = serializeOne(await useUser({ username: usernameDecoded }));
    const canView =
        (profile && profile.isPublic) ||
        (profile && profile.associates.includes(user.id.toString()));

    return (
        <main className={styles.main}>
            <div className={styles.titleBlock}>
                <h2>Profile</h2>
            </div>

            <section>
                <div className="paragraph">
                    {canView ? (
                        <>
                            <h3>{profile.username}'s profile</h3>

                            <p>
                                Username: {profile.username}
                                <br />
                                Joined:{" "}
                                {new Intl.DateTimeFormat("en-US", {
                                    dateStyle: "long",
                                    timeStyle: "short",
                                }).format(new Date(profile.createdAt))}
                            </p>
                        </>
                    ) : (
                        <>
                            <h3>404</h3>
                            <p>Profile not found</p>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}
