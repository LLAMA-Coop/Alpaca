import { SourceDisplay } from "@components/server";
import { InputPopup, SourceInput } from "@components/client";
import styles from "@/app/page.module.css";
import { redirect } from "next/navigation";
import { serialize, serializeOne } from "@/lib/db";
import Link from "next/link";
import { canEdit, queryReadableResources, useUser } from "@/lib/auth";
import { Source, User } from "@mneme_app/database-models";

export default async function SourcesPage({ searchParams }) {
    const user = await useUser();
    User.populate(user, ["groups", "associates"]);
    const query = queryReadableResources(user);

    const page = Number(searchParams["page"] ?? 1);
    const amount = Number(searchParams["amount"] ?? 10);
    if (page < 1 || amount < 1) {
        return redirect(
            `/sources?page=${page < 1 ? 1 : page}&amount=${
                amount < 1 ? 10 : amount
            }`,
        );
    }

    const sources = serialize(
        await Source.find(query)
            .limit(amount)
            .skip((page - 1) * amount),
    );

    const hasMore =
        (
            await Source.find(query)
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
                                {user && canEdit(src, user) && (
                                    <InputPopup
                                        type="source"
                                        resource={serializeOne(src)}
                                    />
                                )}
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

            {user && (
                <section>
                    <h3>Create new source</h3>

                    <SourceInput />
                </section>
            )}
        </main>
    );
}
