import { redirect } from "next/navigation";
import styles from "@/app/page.module.css";
import { Source } from "@/app/api/models";
import { cookies } from "next/headers";
import { SourceDisplay } from "@/app/components/server";
import { canRead, useUser } from "@/lib/auth";

export default async function SourcePage({ params }) {
    const { id } = params;

    const source = await Source.findById(id);

    const user = await useUser({ token: cookies().get("token")?.value });
    if (!canRead(source, user)) {
        return redirect("/sources");
    }

    return (
        <main className={styles.main}>
            <SourceDisplay source={source} />
        </main>
    );
}
