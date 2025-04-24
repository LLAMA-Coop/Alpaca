import styles from "@/app/(mainapp)/page.module.css";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { Avatar } from "@/app/components/client";

export default async function UserPage(props) {
    const params = await props.params;

    const {
        username
    } = params;

    const user = await useUser({
        token: (await cookies()).get("token")?.value,
        select: ["id", "username"],
    });

    if (!user) return redirect(`/login?next=/users/${username}`);

    const usernameDecoded = decodeURIComponent(username);
    if (user.username === usernameDecoded) return redirect("/me/dashboard");

    const profile = await useUser({
        username: usernameDecoded,
        select: [
            "id",
            "publicId",
            "username",
            "avatar",
            "displayName",
            "description",
            "createdAt",
            "isPrivate",
        ],
    });

    // const canView =
    //     (profile && profile.isPublic) ||
    //     (profile && profile.associates.includes(user.id));

    const canView = profile && !profile.isPrivate;

    return (
        <main className={styles.main}>
            <header>
                {canView ? (
                    <h1>
                        {profile.avatar && (
                            <div style={{ margin: "0 auto 24px", width: "fit-content" }}>
                                <Avatar
                                    size={300}
                                    src={profile.avatar}
                                    username={profile.username}
                                />
                            </div>
                        )}
                        {profile.username}'s Profile
                    </h1>
                ) : (
                    <h1>Profile not found</h1>
                )}
            </header>

            <section>
                {canView ? (
                    <>
                        <h2>{profile.username}</h2>
                        <p>{profile.displaName}</p>
                        <p>{profile.description}</p>
                        <p>Created on: {new Date(profile.createdAt).toLocaleDateString()}</p>
                    </>
                ) : (
                    <>
                        <h3>404</h3>
                        <p>Profile not found</p>
                    </>
                )}
            </section>
        </main>
    );
}
