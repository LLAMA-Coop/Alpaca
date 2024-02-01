import styles from "./ballot.module.css";
import { Ballot } from "../components/Ballot/Ballot";
import BallotModel from "../api/models/Ballot";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { serializeOne } from "@/lib/db";
import questionnaire from "./questionnaire";

export default async function BallotPage() {
    const choices = ["Objection", "No Objection", "Abstain"];

    const motions = [
        `blah blah`,
        `blah
        blah`,
    ];

    const user = await useUser({ token: cookies().get("token")?.value });

    const questionsPromises = questionnaire.map(async (point) => {
        const ballotsPromises = point.questions.map(async (q) => {
            const ballot = user
                ? await BallotModel.findOne({
                      voter: user._id,
                      motion: q.motion,
                  })
                : undefined;

            return {
                motion: q.motion,
                choices: q.choices,
                ballot: serializeOne(ballot)
            }
        });

        const ballots = await Promise.all(ballotsPromises);

        return {
            ballots,
            heading: point.heading
        }
    });

    const questions = await Promise.all(questionsPromises);

    const ballotsPromises = motions.map(async (motion) => {
        const ballot = user
            ? await BallotModel.findOne({ voter: user._id, motion })
            : undefined;

        return {
            motion,
            choices,
            ballot: serializeOne(ballot),
        };
    });

    const ballots = await Promise.all(ballotsPromises);

    return (
        <main className={styles.main}>
            {/* <ol>
                {ballots.map((ballot, index) => (
                    <li key={index}>
                        <Ballot
                            motion={ballot.motion}
                            choices={choices}
                            ballot={ballot.ballot}
                        />
                    </li>
                ))}
            </ol> */}
            {questions.map((point, index) => (
                <section key={index}>
                    <h2>{point.heading}</h2>
                    <ol>
                        {point.ballots.map((ballot, index) => (
                            <li key={index}>
                                <Ballot motion={ballot.motion} choices={ballot.choices} />
                            </li>
                        ))}
                    </ol>
                </section>
            ))}
        </main>
    );
}
