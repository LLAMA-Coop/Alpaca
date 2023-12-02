import { NoteDisplay, QuizDisplay, SourceDisplay } from "@components/server";
import { redirect } from "next/navigation";
import styles from "@/app/page.module.css";
import { serializeOne } from "@/lib/db";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
// import { Source, Quiz, Note } from "@mneme_app/database-models";
import { Source, Note, Quiz, Course } from "@/app/api/models";
import InviteUser from "@/app/components/notification/inviteUser";
import Notifications from "@/app/components/notification/notifications";
import { CourseDisplay } from "@/app/components/course/CourseDisplay";
import Image from "next/image";
import Link from "next/link";

export default async function DashboardPage() {
    const user = await useUser({ token: cookies().get("token")?.value });
    if (!user) return redirect("/login");
    user.populate("associates");

    const sources = await Source.find({ contributors: user.id });
    const quizzes = await Quiz.find({ contributors: user.id });
    const notes = await Note.find({ contributors: user.id });

    const courses = await Course.find();

    return (
        <main className={styles.main}>
            <h2>Dashboard</h2>

            <section>
                <h3>Courses</h3>

                <ul>
                    {courses.map((c) => (
                        <li key={c._id}>
                            <Link href={`/courses/${c._id}`}>
                                <CourseDisplay course={c} />
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h3>Your Profile</h3>

                <div className="paragraph">
                    <p>Hello user, here's your account!</p>

                    <p>
                        Display Name: {user.displayName}
                        <br />
                        Username: {user.username}
                        <br />
                        Created At:{" "}
                        {new Intl.DateTimeFormat("en-Us", {}).format(
                            new Date(user.createdAt),
                        )}
                    </p>
                </div>
            </section>

            <section>
                <h3>Your Notifications</h3>

                <Notifications />
            </section>

            <section>
                <h3>Your Contributions</h3>

                <h4>Quiz Questions</h4>
                {quizzes.length > 0 ? (
                    <div className="paragraph">
                        <p>
                            You have {quizzes.length} quiz questions to which
                            you have contributed.
                        </p>
                    </div>
                ) : (
                    <div className="paragraph">
                        <p>No quiz questions</p>
                    </div>
                )}

                <h4>Notes</h4>
                {notes.length > 0 ? (
                    <div className="paragraph">
                        <p>
                            You have {notes.length} notes to which you have
                            contributed.
                        </p>
                    </div>
                ) : (
                    <div className="paragraph">
                        <p>No notes</p>
                    </div>
                )}

                <h4>Sources</h4>
                {sources.length > 0 ? (
                    <div className="paragraph">
                        <p>
                            You have {sources.length} sources to which you have
                            contributed.
                        </p>
                    </div>
                ) : (
                    <div className="paragraph">
                        <p>No sources</p>
                    </div>
                )}
            </section>

            <section>
                <h3>Your Associates</h3>
                {user.associates.length > 0 && (
                    <ol>
                        {user.associates.map((associate) => {
                            return (
                                <li key={associate._id}>
                                    {associate.displayName ===
                                    associate.username
                                        ? associate.username
                                        : `${associate.displayName} (${associate.username})`}
                                    {associate.avatar && (
                                        <Image src={associate.avatar} />
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                )}

                {user.associates.length === 0 && <p>You have no associates</p>}

                <InviteUser />
            </section>
        </main>
    );
}
