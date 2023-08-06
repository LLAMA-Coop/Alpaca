import { Profile } from "@components/client";
import styles from "@/app/Page.module.css";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import User from "@models/User";

const getUser = async () => {
    const token = cookies().get("token")?.value;
    console.log(token);
    if (!token) return redirect("/login");

    const user = await User.findOne({
        refreshTokens: token,
    });

    if (!user) return redirect("/login");

    return user;
};

export default async function page({ params: { username } }) {
    const user = await getUser();

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
