import { SourceDisplay } from "@components/server";
import { SourceInput } from "@components/client";
import styles from "@/app/Page.module.css";
import { serialize } from "@/lib/db";
import Source from "@models/Source";

export default async function SourcesPage() {
    const sources = serialize(await Source.find());

    return (
        <main className={styles.main}>
            <h2>Sources</h2>

            {sources.length > 0 && (
                <section>
                    <h3>Your sources</h3>

                    <ol className={styles.listGrid}>
                        {sources.map((src) => (
                            <li key={src.id}>
                                <SourceDisplay source={src} />
                            </li>
                        ))}
                    </ol>
                </section>
            )}

            <section>
                <h3>Create new source</h3>

                <SourceInput
                    availableSources={sources.map((src) => {
                        const { title, url, id } = src;
                        return { title, url, id: id.toString() };
                    })}
                />
            </section>
        </main>
    );
}
