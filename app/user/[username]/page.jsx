import styles from "@/app/Page.module.css";
import { redirect } from "next/navigation";
import { useUser } from "@/lib/auth";

export default async function UserPage({ params: { username } }) {
    const user = await useUser();

    if (!user) return redirect("/login");
    if (user.username === username) return redirect("/me/dashboard");

    return (
        <main className={styles.main}>
            <section>
                <h2>Hello, {user.username}</h2>

                <div className={styles.description}>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Donec aliquam, velit vitae tincidunt ultricies, elit
                        nisi ultrices urna, eget ultrices velit elit nec ipsum.
                        Donec euismod tincidunt felis, sit amet aliquet nunc.
                        Donec euismod sollicitudin nunc, sed aliquam nisl.
                    </p>
                </div>
            </section>
        </main>
    );
}
