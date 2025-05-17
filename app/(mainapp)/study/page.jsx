import { getPermittedResources } from "@/lib/db/helpers";
import styles from "@/app/(mainapp)/page.module.css";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import shuffleArray from "@/lib/shuffleArray";
import {
  MasoneryList,
  NoteDisplay,
  QuizDisplay,
} from "@/app/components/client";

export default async function StudyPage() {
  const user = await useUser({ token: (await cookies()).get("token")?.value });

  const { notes, quizzes } = await getPermittedResources({
    userId: user ? user.id : undefined,
    withNotes: true,
    withQuizzes: true,
  });

  return (
    <main className={styles.main}>
      <header>
        <h1>Study</h1>

        <p>
          This is where you study your notes and practice quiz questions without
          trying to level up
        </p>
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
