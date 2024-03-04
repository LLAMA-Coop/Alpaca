import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import Ballot from "../api/models/Ballot";
import elections from "../ballot/boardelection04MAR2024";
import { serialize } from "@/lib/db";
import Votes from "./votes";
import styles from "./results.module.css"

export default async function ResultsPage() {
    const user = await useUser({ token: cookies().get("token")?.value });
    if (!user) redirect("/login");

    const votesPromises = elections.map(async (b) => {
        const ballotsPromises = b.questions.map(async (q) => {
            const votes = await Ballot.find({ motion: q.motion });

            return {
                motion: q.motion,
                votes: serialize(votes),
            };
        });

        const ballots = await Promise.all(ballotsPromises);

        return {
            ballots,
            heading: b.heading,
        };
    });

    const results = await Promise.all(votesPromises);

    return (
        <main className={styles.main}>
            {results.map((result, index) => (
                <section key={index}>
                    <h2>{result.heading}</h2>
                    <ol>
                        {result.ballots.map((ballot, index) => (
                            <li key={`question${index}`}>
                                <h3>{ballot.motion}</h3>
                                {ballot.votes.length ? (
                                    <Votes votes={ballot.votes} />
                                ) : (
                                    <p>No votes yet</p>
                                )}
                            </li>
                        ))}
                    </ol>
                </section>
            ))}
        </main>
    );
}
