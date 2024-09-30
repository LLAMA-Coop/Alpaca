import { getPermittedResources } from "@/lib/db/helpers";
import { MasoneryList, SourceDisplay } from "@client";
import styles from "@main/page.module.css";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";

export default async function SourcesPage({ searchParams }) {
  const user = await useUser({ token: cookies().get("token")?.value });

  const page = Number(searchParams["page"] ?? 1);
  const amount = Number(searchParams["amount"] ?? 10);

  if (page < 1 || amount < 1) {
    return redirect(
      `/sources?page=${page < 1 ? 1 : page}&amount=${amount < 1 ? 10 : amount}`
    );
  }

  const { sources } = await getPermittedResources({
    withSources: true,
    userId: user?.id,
  });

  const hasMore = false;

  if (page > 1 && sources.length === 0) {
    return redirect("/sources?page=1&amount=" + amount);
  }

  return (
    <main className={styles.main}>
      <header>
        <h1>Sources</h1>

        <p>
          A source is a record of a resource such as a book, website, or video
          tutorial, that you can cite for your notes or quiz questions.{` `}
          {user
            ? `These are the sources that are publicly viewable, as well as the ones you made.`
            : `You are only viewing the publicly available sources.
                           Log in to see sources available to you.`}
        </p>
      </header>

      <section>
        {sources.length > 0 ? (
          <>
            <h2>Available Sources</h2>

            <MasoneryList>
              {sources.map((source) => (
                <SourceDisplay key={source.id} source={source} />
              ))}
            </MasoneryList>

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
          </>
        ) : (
          <div className={styles.noResults}>
            <Image
              src="/assets/no-results.svg"
              alt="No sources"
              height={400}
              width={400}
            />

            <p>
              Hey, we searched high and low, but we couldn't find any sources.
            </p>
            {user ? (
              <p>
                Maybe you should try again later or create your own sources.
              </p>
            ) : (
              <p>
                You may find more when you <Link className="link" href="/login">log in</Link> or{" "}
                <Link className="link" href="/register">register</Link>
              </p>
            )}

            <Link className="button primary" href="/create">
              Create a source
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
