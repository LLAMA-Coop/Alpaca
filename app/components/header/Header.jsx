import { Profile } from "@components/client";
import { DynamicNav } from "./DynamicNav";
import styles from "./Header.module.css";
import { cookies } from "next/headers";
import User from "@models/User";
import Link from "next/link";

const getUser = async () => {
    const token = cookies().get("token")?.value;
    if (!token) return null;

    const user = await User.findOne({
        refreshTokens: token,
    });

    if (!user) return null;
    return user;
};

export async function Header() {
    const user = await getUser();

    return (
        <header className={styles.header}>
            <div>
                <h1>
                    <Link href="/">Mneme</Link>
                </h1>

                <nav>
                    <DynamicNav />
                </nav>

                {user ? (
                    <Profile user={user} />
                ) : (
                    <div>
                        <Link href="/login">Login</Link>
                    </div>
                )}
            </div>
        </header>
    );
}
