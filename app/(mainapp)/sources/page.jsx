import { getPermittedResources } from "@/lib/db/helpers";
import styles from "@main/page.module.css";
import { redirect } from "next/navigation";
import { SourceDisplay } from "@server";
import { cookies } from "next/headers";
import { InputPopup } from "@client";
import { useUser } from "@/lib/auth";
import Link from "next/link";

export default async function SourcesPage({ searchParams }) {
    const user = await useUser({ token: cookies().get("token")?.value });

    const page = Number(searchParams["page"] ?? 1);
    const amount = Number(searchParams["amount"] ?? 10);

    if (page < 1 || amount < 1) {
        return redirect(
            `/sources?page=${page < 1 ? 1 : page}&amount=${
                amount < 1 ? 10 : amount
            }`,
        );
    }

    const { sources } = await getPermittedResources({
        withSources: true,
        userId: user?.id,
    });

    const hasMore = false;

    if (page > 1 && sources.length === 0) {
        redirect("/sources?page=1&amount=" + amount);
    }

    return (
        <main className={styles.main}>
            <header>
                <h1>Sources</h1>

                <p>
                    A source is a record of a resource such as a book, website,
                    or video tutorial, that you can cite for your notes or quiz
                    questions.{` `}
                    {user
                        ? `These are the sources that are publicly viewable, as well as the ones you made.`
                        : `You are only viewing the publicly available sources.
                           Log in to see sources available to you and create your own sources.`}
                </p>
            </header>

            <section>
                <h2>Available Sources</h2>

                <ol className={styles.listGrid}>
                    {sources.map((source) => {
                        const isCreator = user && source.creator.id === user.id;
                        const canWrite = isCreator || source.allCanWrite;

                        return (
                            <li key={source.id}>
                                <SourceDisplay source={source} />

                                {canWrite && (
                                    <InputPopup
                                        type="source"
                                        resource={source}
                                    />
                                )}

                                <Link href={`/sources/${source.id}`}>
                                    Go to Source Page
                                </Link>
                            </li>
                        );
                    })}

                    {sources.length === 0 && (
                        <p className={styles.noContent}>
                            Oh, that's awkward. There are no sources to display.
                            <br />
                            <Link className="link" href="/register">
                                Register
                            </Link>{" "}
                            and create your own sources, you'll love it!
                        </p>
                    )}
                </ol>

                {sources.length > 0 && (
                    <div className={styles.paginationButtons}>
                        {page > 1 ? (
                            <Link
                                className="button submit primary"
                                href={`/sources?page=${page - 1}&amount=${amount}`}
                            >
                                Previous page
                            </Link>
                        ) : (
                            <button disabled className="button submit primary">
                                Previous page
                            </button>
                        )}

                        {hasMore ? (
                            <Link
                                className="button submit primary"
                                href={`/sources?page=${page + 1}&amount=${amount}`}
                            >
                                Next page
                            </Link>
                        ) : (
                            <button disabled className="button submit primary">
                                Next page
                            </button>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}
