import { redirect } from "next/navigation";
import styles from "@/app/page.module.css";
import { Course, Source, Note, Quiz } from "@/app/api/models";
import { cookies } from "next/headers";
import { canRead, useUser, queryReadableResources } from "@/lib/auth";
import {
    NoteDisplay,
    SourceDisplay,
    CourseDisplay,
} from "@/app/components/server";
import { QuizDisplay, UserStats } from "@/app/components/client";
import { serializeOne } from "@/lib/db";

export default async function CoursePage({ params }) {
    const { id } = params;

    const course = await Course.findById(id)
        .populate("prerequisites.course")
        .populate("parentCourses");
    if (!course) return redirect("/groups");

    const user = await useUser({ token: cookies().get("token")?.value });
    if (!canRead(course, user)) {
        return redirect("/groups");
    }

    const query = queryReadableResources(user);
    const availableSources = await Source.find(query);
    const availableNotes = await Note.find(query);
    const availableQuizzes = await Quiz.find(query);
    function filter(x) {
        return x.courses.find((c) => c.toString() === id);
    }
    const sources = availableSources.filter(filter);
    const notes = availableNotes.filter(filter);
    const quizzes = availableQuizzes.filter(filter);

    let sum = 0;
    let countOfCanLevel = 0;
    const userQuizzes = quizzes.map((q) => {
        const userQuiz = user.quizzes.find(
            (x) => x.quizId.toString() === q._id.toString(),
        );
        if (userQuiz) {
            sum += userQuiz.level;
            if(userQuiz.hiddenUntil < Date.now()){
                countOfCanLevel++;
            }
            return userQuiz;
        }
        return {
            quizId: q._id,
            lastCorrect: new Date(0),
            level: 0,
            hiddenUntil: new Date(0),
        };
    });
    const averageLevel = sum / quizzes.length;

    return (
        <main className={styles.main}>
            <div className={styles.titleBlock}>
                <h2>{course.name}</h2>
                <p>{course.description}</p>
                <p>Average Level: {averageLevel}</p>
                <p>Quizzes Available to Level Up: {countOfCanLevel}</p>
            </div>

            {course.prerequisites.length > 0 && (
                <section>
                    <h3>Prerequisites</h3>
                    <ul>
                        {course.prerequisites.map((p) => {
                            return (
                                <li key={p.course.id}>
                                    <p>{p.averageLevelRequired}</p>
                                    <CourseDisplay course={p.course} />
                                </li>
                            );
                        })}
                    </ul>
                </section>
            )}

            {course.parentCourses.length > 0 && (
                <section>
                    <h3>Parent Courses</h3>
                    <ul>
                        {course.parentCourses.map((c) => {
                            return (
                                <li key={c.id}>
                                    <CourseDisplay course={c} />
                                </li>
                            );
                        })}
                    </ul>
                </section>
            )}

            {sources.length > 0 && (
                <section>
                    <h3>Sources for {course.name}</h3>
                    <ul>
                        {sources.map((source) => (
                            <li key={source._id}>
                                <SourceDisplay source={source} />
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {notes.length > 0 && (
                <section>
                    <h3>Notes for {course.name}</h3>
                    <ul>
                        {notes.map((note) => (
                            <li key={note._id}>
                                <NoteDisplay note={note} />
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {quizzes.length > 0 && (
                <section>
                    <h3>Quizzes for {course.name}</h3>
                    <ul>
                        {quizzes.map((quiz) => {
                            const userQuiz = userQuizzes.find(
                                (x) =>
                                    x.quizId.toString() === quiz._id.toString(),
                            );
                            return (
                                <li key={quiz._id}>
                                    <QuizDisplay
                                        quiz={serializeOne(quiz)}
                                        canClientCheck={false}
                                    />
                                    {userQuiz && (
                                        <UserStats userQuizInfo={userQuiz} />
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </section>
            )}
        </main>
    );
}
