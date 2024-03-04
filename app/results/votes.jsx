import shuffleArray from "@/lib/shuffleArray";
import styles from "./votes.module.css";

export default function Votes({ votes }) {
    let firstChoices = [];
    let secondChoices = [];
    let thirdChoices = [];
    let votesAgainst = [];
    let amendments = [];

    votes.forEach((v) => {
        if (v.firstChoice) firstChoices.push(v.firstChoice);
        if (v.secondChoice) secondChoices.push(v.secondChoice);
        if (v.thirdChoice) thirdChoices.push(v.thirdChoice);
        if (v.voteAgainst) votesAgainst.push(v.voteAgainst);
        if (v.amendment) amendments.push(v.amendment);
    });

    // firstChoices = shuffleArray(firstChoices);
    // secondChoices = shuffleArray(secondChoices);
    // thirdChoices = shuffleArray(thirdChoices);
    // votesAgainst = shuffleArray(votesAgainst);
    // amendments = shuffleArray(amendments);

    return (
        <div className={styles.main}>
            {/* <div>
                <h4>First Choices</h4>
                {firstChoices.length ? (
                    <ol>
                        {firstChoices.map((c, index) => (
                            <li key={index}>{c}</li>
                        ))}
                    </ol>
                ) : (
                    <p>No first choices</p>
                )}
            </div>

            <div>
                <h4>Second Choices</h4>
                {secondChoices.length ? (
                    <ol>
                        {secondChoices.map((c, index) => (
                            <li key={index}>{c}</li>
                        ))}
                    </ol>
                ) : (
                    <p>No second choices</p>
                )}
            </div>

            <div>
                <h4>Third Choices</h4>
                {thirdChoices.length ? (
                    <ol>
                        {thirdChoices.map((c, index) => (
                            <li key={index}>{c}</li>
                        ))}
                    </ol>
                ) : (
                    <p>No third choices</p>
                )}
            </div> */}
            <table>
                <thead>
                    <tr>
                        <th>First Choice</th>
                        <th>Second Choice</th>
                        <th>Third Choice</th>
                    </tr>
                </thead>
                <tbody>
                    {votes.map((vote) => (
                        <tr key={vote._id}>
                            <td>{vote.firstChoice}</td>
                            <td>{vote.secondChoice}</td>
                            <td>{vote.thirdChoice}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
