import { redirect } from "next/navigation";
import styles from "@/app/page.module.css";
import { cookies } from "next/headers";
import { SourceDisplay } from "@/app/components/server";
import { useUser } from "@/lib/auth";
import { getPermittedSource } from "@/lib/db/helpers";
import { SourceInput } from "@/app/components/client";

export default async function SourcePage({ params }) {
    const { id } = params;

    const user = await useUser({ token: cookies().get("token")?.value });
    if (!user) {
        return redirect("/login");
    }
    const source = await getPermittedSource(id, user.id);
    if (!source) {
        return redirect("/sources");
    }

    return (
        <main className={styles.main}>
            <section>
                <SourceDisplay source={source} />
            </section>
            {source.permissionType === "write" && (
                <section>
                    <SourceInput source={source} />
                </section>
            )}
        </main>
    );
}
