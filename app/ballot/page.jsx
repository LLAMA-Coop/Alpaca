import styles from "./ballot.module.css";
import { Ballot } from "../components/Ballot/Ballot";
import BallotModel from "../api/models/Ballot";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { serializeOne } from "@/lib/db";
import questionnaire from "./boardelection04MAR2024";
import { BallotProgress } from "./ballotProgress";

export default async function BallotPage() {
    const user = await useUser({ token: cookies().get("token")?.value });
    const motions = [];
    const votes = [];

    const questionsPromises = questionnaire.map(async (point) => {
        const ballotsPromises = point.questions.map(async (q) => {
            const ballot = user
                ? await BallotModel.findOne({
                      voter: user._id,
                      motion: q.motion,
                  })
                : undefined;

            motions.push(q.motion);
            if (user && ballot != undefined) {
                votes.push(serializeOne(ballot));
            }

            return {
                motion: q.motion,
                choices: q.choices,
                options: q.options == undefined ? q.options : {},
                ballot: serializeOne(ballot),
            };
        });

        const ballots = await Promise.all(ballotsPromises);

        return {
            ballots,
            heading: point.heading,
        };
    });

    const questions = await Promise.all(questionsPromises);

    const defaultOptions = {
        numberChoices: 3,
        voteAgainst: false,
        canAmend: false,
    };

    return (
        <main className={styles.main}>
            <div>
                <BallotProgress
                    motions={motions}
                    ballots={votes}
                    questions={questions}
                />
                <div>
                    {questions.map((point, index) => (
                        <section
                            key={index}
                            className={styles.ballot}
                            id={point.heading}
                        >
                            <h2>{point.heading}</h2>
                            <ol>
                                {point.ballots.map((ballot, index) => (
                                    <li key={index}>
                                        <Ballot
                                            motion={ballot.motion}
                                            choices={ballot.choices}
                                            ballot={ballot.ballot}
                                            options={
                                                ballot.options
                                                    ? ballot.options
                                                    : defaultOptions
                                            }
                                        />
                                    </li>
                                ))}
                            </ol>
                        </section>
                    ))}
                </div>
                <div></div>
            </div>
        </main>
    );
}
