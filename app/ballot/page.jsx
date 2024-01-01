import styles from "../page.module.css";
import { Ballot } from "../components/Ballot/Ballot";
import BallotModel from "../api/models/Ballot";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { serializeOne } from "@/lib/db";

const choices = [
    "Gnosis",
    "Backronym",
    "LLAMA - Learning Language and Multicultural Advancement",
    "Sunago",
    "Arete",
    "Xenia",
    "Oikos",
];

const motion = "What shall the name of our company be?";

export default async function BallotPage() {
    const user = await useUser({ token: cookies().get("token")?.value });
    const ballot = user
        ? serializeOne(await BallotModel.findOne({ voter: user._id, motion }))
        : undefined;

    return (
        <main className={styles.main}>
            {!user && <Ballot motion={motion} choices={choices} />}
            {user && ballot && (
                <Ballot motion={motion} choices={choices} ballot={ballot} />
            )}
        </main>
    );
}
