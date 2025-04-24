import styles from "@/app/(mainapp)/page.module.css";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";
import Link from "next/link";

export default async function VerifyEmailPage(props) {
    const params = await props.params;
    const { token: emailToken } = params;

    const token = (await cookies()).get("token")?.value;

    const user = await useUser({
        token,
        select: ["id", "emailVerified", "email", "emailVerificationToken"],
    });

    if (!user) redirect(`/login?next=${encodeURIComponent(`/verify-email/${emailToken}`)}`);

    if (!user.email || user.emailVerified || user.emailVerificationToken !== emailToken) {
        return (
            <main className={styles.main}>
                <header>
                    <h1>Invalid token</h1>
                    <p>The token provided is invalid. Please try again.</p>
                </header>
            </main>
        );
    }

    await db
        .updateTable("users")
        .set({
            emailVerified: true,
            emailVerificationToken: null,
        })
        .where("id", "=", user.id)
        .execute();

    return (
        <main className={styles.main}>
            <header>
                <h1>Email verified</h1>

                <p>
                    Your email has been successfully verified. You may now return to the dashboard.
                </p>

                <Link
                    className="button primary round"
                    href="/me/dashboard"
                >
                    Go to dashboard
                </Link>
            </header>
        </main>
    );
}
