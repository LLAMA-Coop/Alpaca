import { CourseDisplay } from "@/app/components/Course/CourseDisplay";
import { Avatar, InviteUser, Notifications } from "@client";
import { Source, Note, Quiz, Course, User } from "@models";
import { redirect } from "next/navigation";
import styles from "@/app/page.module.css";
import { cookies } from "next/headers";
import { serialize } from "@/lib/db";
import { useUser } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
    const user = await useUser({ token: cookies().get("token")?.value });
    if (!user) return redirect("/login");

    user.populate("associates");
    user.populate("groups");

    const sources = await Source.find({ contributors: user.id });
    const quizzes = await Quiz.find({ contributors: user.id });
    const notes = await Note.find({ contributors: user.id });
    const courses = await Course.find();

    const publicUsers = serialize(
        await User.find({
            isPublic: true,
            _id: { $ne: user.id },
        }),
    );

    return (
        <main className={styles.main}>
            <div className={styles.titleBlock}>
                <h2>Dashboard</h2>
            </div>

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

                <div>
                    <h4>Your Notifications</h4>

                    <Notifications />
                </div>

                <div className={`${styles.profile} paragraph`}>
                    <h4>Your Contributions</h4>

                    <h5>Quiz Questions</h5>
                    <div className="paragraph">
                        <p>
                            {quizzes.length
                                ? `You have ${quizzes.length} quiz questions to which
                                   you have contributed.`
                                : `No quiz questions`}
                        </p>
                    </div>

                    <h5>Notes</h5>
                    <div className="paragraph">
                        <p>
                            {notes.length
                                ? `You have ${notes.length} notes to which you have
                                   contributed.`
                                : `No notes`}
                        </p>
                    </div>

                    <h5>Sources</h5>
                    <div className="paragraph">
                        <p>
                            {notes.length
                                ? `You have ${sources.length} sources to which you have
                                   contributed.`
                                : `No sources`}
                        </p>
                    </div>
                </div>
            </section>

            <section>
                <h3>Courses</h3>

                <ul>
                    {courses.map((c) => (
                        <li key={c.id}>
                            <Link href={`/courses/${c.id}`}>
                                <CourseDisplay course={c} />
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h3>Your Groups</h3>
                {user.groups.length > 0 && (
                    <ol>
                        {user.groups.map((group) => (
                            <li key={group.id}>
                                <h4>{group.name}</h4>
                                <p>{group.description}</p>
                            </li>
                        ))}
                    </ol>
                )}
            </section>

            <section>
                <h3>Your Associates</h3>

                {user.associates.length > 0 ? (
                    <ol>
                        {user.associates.map((associate) => (
                            <li key={associate.id} className={styles.associate}>
                                {associate.displayName === associate.username
                                    ? associate.username
                                    : `${associate.displayName} (${associate.username})`}

                                {associate.avatar && (
                                    <Avatar
                                        src={associate.avatar}
                                        username={associate.username}
                                        size={50}
                                    />
                                )}
                            </li>
                        ))}
                    </ol>
                ) : (
                    <p>You have no associates</p>
                )}

                <div style={{ marginTop: "40px" }}>
                    <h4>Add an Associate</h4>
                    <InviteUser publicUsers={publicUsers} />
                </div>
            </section>
        </main>
    );
}
