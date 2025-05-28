import { getPermittedResources } from "@/lib/db/helpers";
import { SearchOptions } from "../[resource]/SearchOptions";
import styles from "@/app/(mainapp)/page.module.css";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import shuffleArray from "@/lib/shuffleArray";
import {
  MasoneryList,
  NoteDisplay,
  QuizDisplay,
} from "@/app/components/client";

const DEFAULT_PAGE_SIZE = 10;

export default async function StudyPage(props) {
  const searchParams = await props.searchParams;
  const user = await useUser({ token: (await cookies()).get("token")?.value });

  const page = Number(searchParams["page"] ?? 1);
  const amount = Number(searchParams["amount"] ?? DEFAULT_PAGE_SIZE);
  const tag = searchParams["tag"] ?? null;

  const { notes, quizzes } = await getPermittedResources({
    userId: user ? user.id : undefined,
    withNotes: true,
    withQuizzes: true,
    userId: user?.id,
    limit: amount,
    offset: (page - 1) * amount,
    tagSearch: tag ? tag : undefined,
  });

  return (
    <main className={styles.main}>
      <header>
        <h1>Study</h1>

        <p>
          This is where you study your notes and practice quiz questions without
          trying to level up
        </p>

        <SearchOptions
          tag={tag}
          page={page}
          amount={amount}
          maxPage={100}
          name="study"
          noTags={false}
        />
      </header>

      <section>
        <h2>Notes</h2>
        <MasoneryList>
          {shuffleArray(notes).map((note) => (
            <NoteDisplay key={note.id} note={note} />
          ))}
        </MasoneryList>
      </section>

      <section>
        <h2>Flashcards</h2>
        <MasoneryList>
          {shuffleArray(quizzes)
            .sort((quiz1, quiz2) => quiz1.level - quiz2.level)
            .map((quiz) => (
              <QuizDisplay
                key={quiz.id}
                quiz={quiz}
                canClientCheck={true}
                canEditDelete={true}
                isFlashcard={true}
              />
            ))}
        </MasoneryList>
      </section>
    </main>
  );
}
