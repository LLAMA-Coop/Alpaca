import QuizInput from "../components/quiz/quizInput";
import QuizDisplay from "../components/quiz/quizDisplay";
import Source from "../api/models/Source";
import Note from "../api/models/Note";
import Quiz from "../api/models/Quiz";
import styles from "../page.module.css";

export default async function QuizzesPage() {
  const sources = await Source.find();
  const notes = await Note.find();
  const quizzes = await Quiz.find();
  const availableSources = sources.map((src) => {
    return {
      _id: src._id.toString(),
      title: src.title,
      url: src.url,
    };
  });
  const availableNotes = notes.map((note) => {
    return {
      _id: note._id.toString(),
      text: note.text,
    };
  });

  return (
    <main className={styles.main}>
      <h2>Quizzes</h2>

      <section>
        <ul>
          {quizzes.map((quiz) => {
            let { _id, prompt, correctResponses, sources, notes } = quiz;
            let quizForClient = {
              _id: _id.toString(),
              prompt,
              correctResponses,
              sources: sources.map(x => x.toString()),
              notes: notes.map(x => x.toString()),
            };

            return (
              <li key={quiz._id}>
                <QuizDisplay quiz={quizForClient} canClientCheck={true}></QuizDisplay>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <QuizInput
          isEditing={false}
          availableSources={availableSources}
          availableNotes={availableNotes}
        />
      </section>
    </main>
  );
}
