import { SourceDisplay } from "@components/server";
import { SourceInput } from "@components/client";
import styles from "@/app/page.module.css";
import { redirect } from "next/navigation";
import { serialize } from "@/lib/db";
import Source from "@models/Source";
import Link from "next/link";

export default async function SourcesPage({ searchParams }) {
    const page = Number(searchParams["page"] ?? "1");
    const amount = Number(searchParams["amount"] ?? "10");

    if (page < 1) {
        return redirect("/sources?page=1&amount=" + amount);
    }

    if (amount < 1) {
        return redirect("/sources?page=" + page + "&amount=10");
    }

    const sources = serialize(
        await Source.find()
            .limit(amount)
            .skip((page - 1) * amount),
    );

    const hasMore =
        (
            await Source.find()
                .limit(1)
                .skip((page - 1) * amount + amount)
        )?.length > 0;

    if (page > 1 && sources.length === 0) {
        redirect("/sources?page=1&amount=" + amount);
    }

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

                    <div className={styles.paginationButtons}>
                        {page > 1 ? (
                            <Link
                                className="button submit"
                                href={`/sources?page=${
                                    page - 1
                                }&amount=${amount}`}
                            >
                                Previous page
                            </Link>
                        ) : (
                            <button disabled className="button submit">
                                Previous page
                            </button>
                        )}

                        {hasMore ? (
                            <Link
                                className="button submit"
                                href={`/sources?page=${
                                    page + 1
                                }&amount=${amount}`}
                            >
                                Next page
                            </Link>
                        ) : (
                            <button disabled className="button submit">
                                Next page
                            </button>
                        )}
                    </div>
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
