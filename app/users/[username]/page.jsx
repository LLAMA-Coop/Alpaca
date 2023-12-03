import styles from "@/app/page.module.css";
import { redirect } from "next/navigation";
import { serializeOne } from "@/lib/db";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";

export default async function UserPage({ params: { username } }) {
    const user = await useUser({ token: cookies().get("token")?.value });

    if (!user) return redirect("/login");
    if (user.username === username) return redirect("/me/dashboard");

    const profile = serializeOne(await useUser({ username }));
    const canView =
        (profile && profile.isPublic) ||
        profile.associates.includes(user._id.toString());

    return (
        <main className={styles.main}>
            <h2>Profile</h2>

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
