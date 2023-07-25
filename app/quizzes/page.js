import QuizInput from "../components/quiz/quizInput";
import Source from "../api/models/Source";
import Note from "../api/models/Note";

export default async function QuizzesPage() {
  // async function getSources(){
  //     return await Source.find();
  // }
  // async function getNotes(){
  //     return await Note.find();
  // }

  const sources = await Source.find();
  const notes = await Note.find();
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
    <main>
      <h2>Add New Quiz Card</h2>
      <QuizInput
        isEditing={false}
        availableSources={availableSources}
        availableNotes={availableNotes}
      ></QuizInput>
    </main>
  );
}
