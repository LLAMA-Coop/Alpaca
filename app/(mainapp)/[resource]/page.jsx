import { getPermittedResources, getRelationships } from "@/lib/db/helpers";
import { SearchOptions } from "./SearchOptions";
import styles from "@main/page.module.css";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db";
import Image from "next/image";
import Link from "next/link";
import { sql } from "kysely";
import {
  TooltipContent,
  TooltipTrigger,
  SourceDisplay,
  CourseDisplay,
  MasoneryList,
  NoteDisplay,
  QuizDisplay,
  Tooltip,
} from "@client";

const DEFAULT_PAGE_SIZE = 10;

const resourceList = [
  {
    name: "sources",
    title: "Sources",
    singular: "source",
    description:
      "A source is a record of a resource such as a book, website, or video tutorial, that you can cite for your notes or quiz questions.",
  },
  {
    name: "notes",
    title: "Notes",
    singular: "note",
    description:
      "A note is a record of your thoughts, ideas, or summaries of a source. You can use notes to create quiz questions or to help you study.",
  },
  {
    name: "quizzes",
    title: "Quizzes",
    singular: "quiz",
    description:
      "A quiz is a question that challenges your understanding and recall of information from a source or note.",
  },
  {
    name: "courses",
    title: "Courses",
    singular: "course",
    description:
      "A course is a collection of notes, quizzes, and sources that are related to a specific topic or subject.",
  },
];

export default async function ResourcePage(props) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const page = Number(searchParams["page"] ?? 1);
  const amount = Number(searchParams["amount"] ?? DEFAULT_PAGE_SIZE);
  const tag = searchParams["tag"] ?? null;

  const current = resourceList.find((r) => r.name === params.resource);
  if (!current) return redirect("/resources");

  const user = await useUser({ token: (await cookies()).get("token")?.value });

  if (page < 1 || amount < 1 || amount > 100) {
    return redirect(
      `/${current.name}?page=${page < 1 ? 1 : page}&amount=${
        amount < 1 ? DEFAULT_PAGE_SIZE : amount > 100 ? 100 : amount
      }${tag ? `&tag=${tag}` : ""}`
    );
  }

  const resourcesObject = await getPermittedResources({
    withSources: current.name === "sources",
    withNotes: current.name === "notes",
    withQuizzes: current.name === "quizzes",
    withCourses: current.name === "courses",
    userId: user?.id,
    limit: amount + 1,
    offset: (page - 1) * amount,
    tagSearch: tag ? tag : undefined,
  });

  const relationships = await getRelationships();
  const includeRef = relationships.filter((x) => !!x.includeReference);

  const type = resourceList.find((x) => x.name === current.name).singular;

  function pushToList(rel, type) {
    if (rel.AType === type) {
      resourcesObject[current.name]
        .filter((x) => x.id === rel.A)
        .forEach((x) => {
          const listType = resourceList.find(
            (x) => x.singular === rel.BType
          ).name;
          if (!x[listType]) x[listType] = [];
          if (!x[listType].includes(rel.B)) x[listType].push(rel.B);
        });
    }

    if (rel.BType === type) {
      resourcesObject[current.name]
        .filter((x) => x.id === rel.B)
        .forEach((x) => {
          const listType = resourceList.find(
            (x) => x.singular === rel.AType
          ).name;
          if (!x[listType]) x[listType] = [];
          if (!x[listType].includes(rel.A)) x[listType].push(rel.A);
        });
    }
  }

  relationships.forEach((rel) => {
    includeRef.forEach((x) => {
      if (
        x.AType !== "course" &&
        x.AType === rel.AType &&
        rel.BType !== "course" &&
        x.A === rel.A
      ) {
        const newRel = {
          A: x.B,
          AType: "course",
          B: rel.B,
          BType: rel.BType,
        };
        relationships.push(newRel);
      }
      
      if (
        x.AType !== "course" &&
        x.AType === rel.BType &&
        rel.BType !== "course" &&
        x.A === rel.B
      ) {
        const newRel = {
          A: rel.A,
          AType: rel.AType,
          B: x.B,
          BType: "course",
        };
        relationships.push(newRel);
      }

      if (x.BType !== "course" && x.BType === rel.BType && x.B === rel.B) {
        const newRel = {
          AType: rel.BType,
          A: rel.B,
          BType: "course",
          B: x.A,
        };
        relationships.push(newRel);
      }
    });
    pushToList(rel, type);
  });

  const resources = resourcesObject[current.name];
  if (!resources) return redirect("/");

  const hasMore = resources.length > amount;

  if (page > 1 && resources.length === 0) {
    return redirect(
      `/${current.name}?page=1&amount=${amount}${tag ? `&tag=${tag}` : ""}`
    );
  }

  const maxPage = await getMaxPage({
    userId: user?.id,
    resource: current.name,
    type: current.singular,
    amount: amount,
  });

  return (
    <main className={styles.main}>
      <section>
        {resources.length > 0 || !!tag ? (
          <>
            <header>
              <h2>
                Available {current.title}
                <Tooltip>
                  <TooltipTrigger>
                    <div tabIndex={0} className={styles.tooltipIcon}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        fill="none"
                        height="24"
                        width="24"
                      >
                        <path d="M8 8a3.5 3 0 0 1 3.5 -3h1a3.5 3 0 0 1 3.5 3a3 3 0 0 1 -2 3a3 4 0 0 0 -2 4" />
                        <path d="M12 19l0 .01" />
                      </svg>
                    </div>
                  </TooltipTrigger>

                  <TooltipContent big maxWidth={350}>
                    {current.description}
                    {user
                      ? ` These are the ${current.name} that are publicly viewable, as well as the ones you made.`
                      : ` You are only viewing the publicly available ${current.name}.
                                                Log in to see ${current.name} available to you.`}
                  </TooltipContent>
                </Tooltip>
              </h2>

              <SearchOptions
                tag={tag}
                page={page}
                amount={amount}
                maxPage={maxPage}
                name={current.name}
                noTags={current.name === "courses"}
              />
            </header>

            {!resources.length && (
              <div className={styles.noResults}>
                <Image
                  width={400}
                  height={400}
                  src="/assets/no-results.svg"
                  alt={`No ${current.singular} found`}
                />

                <p>
                  Hey, we searched high and low, but we couldn't find any{" "}
                  {current.singular} with the tag "{tag}".
                  <br />
                  Try searching for a different tag or{" "}
                  <Link
                    className="link"
                    href={`/${current.name}?page=1&amount=${amount}`}
                  >
                    view all {current.name}
                  </Link>
                  .
                </p>

                <Link href="/create" className="button primary">
                  Create a {current.singular}
                </Link>
              </div>
            )}

            <MasoneryList>
              {resources
                .sort((a, b) => {
                  if (a.createdAt < b.createdAt) return 1;
                  if (a.createdAt > b.createdAt) return -1;
                  return 0;
                })
                .slice(0, amount)
                .map((res) => (
                  <li key={res.id} style={{ width: "100%" }}>
                    {current.name === "sources" && (
                      <SourceDisplay source={res} />
                    )}
                    {current.name === "notes" && <NoteDisplay note={res} />}
                    {current.name === "quizzes" && (
                      <QuizDisplay quiz={res} canEditDelete={true} />
                    )}
                    {current.name === "courses" && (
                      <CourseDisplay course={res} />
                    )}
                  </li>
                ))}
            </MasoneryList>

            <div className={styles.paginationButtons}>
              {page < 2 ? (
                <button disabled className="button submit">
                  Previous page
                </button>
              ) : (
                <Link
                  className="button submit"
                  href={`/${current.name}?page=${page - 1}&amount=${amount}${
                    tag ? `&tag=${tag}` : ""
                  }`}
                >
                  Previous page
                </Link>
              )}

              {!hasMore ? (
                <button disabled className="button submit">
                  Next page
                </button>
              ) : (
                <Link
                  className="button submit"
                  href={`/${current.name}?page=${page + 1}&amount=${amount}${
                    tag ? `&tag=${tag}` : ""
                  }`}
                >
                  Next page
                </Link>
              )}
            </div>
          </>
        ) : (
          <div className={styles.noResults}>
            <Image
              width={400}
              height={400}
              src="/assets/no-results.svg"
              alt={`No ${current.singular} found`}
            />

            <p>
              Hey, we searched high and low, but we couldn't find any{" "}
              {current.singular}.
              <br />
              {user ? (
                `Maybe you should try again later or create your own ${current.name}.`
              ) : (
                <>
                  You may find more when you{" "}
                  <Link className="link" href={`/login?next=/${current.name}`}>
                    log in
                  </Link>{" "}
                  or{" "}
                  <Link className="link" href="/register">
                    register
                  </Link>
                  .
                </>
              )}
            </p>

            <Link href="/create" className="button primary">
              Create a {current.singular}
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

async function getMaxPage({ userId, resource, type, amount }) {
  try {
    const { count } = await db
      .selectFrom(resource)
      .select((eb) => eb.fn.countAll().as("count"))
      .innerJoin(
        "resource_permissions as rp",
        `${resource}.id`,
        "rp.resourceId"
      )
      .where("rp.resourceType", "=", type)
      .where(({ eb, exists, or, and }) =>
        or([
          eb("createdBy", "=", userId),
          and([
            or([
              sql`JSON_CONTAINS(rp.read, ${userId})`,
              sql`JSON_CONTAINS(rp.write, ${userId})`,
              eb("rp.allRead", "=", 1),
              eb("rp.allWrite", "=", 1),
            ]),
            or([
              eb("rp.groupLocked", "=", 0),
              exists(
                eb
                  .selectFrom("members")
                  .select("userId")
                  .where("userId", "=", userId)
                  .whereRef("groupId", "=", "rp.groupId")
              ),
            ]),
          ]),
        ])
      )
      .executeTakeFirstOrThrow();

    const maxPage = Math.ceil(count / amount);
    return maxPage || 1;
  } catch (e) {
    console.error(e);
    return 1;
  }
}
