import styles from "./UserStats.module.css";
import htmlDate from "@/lib/htmlDate";

export function UserStats({ userQuizInfo }) {
    const canLevel = new Date(userQuizInfo.hiddenUntil) < Date.now();

    return (
        <div className={styles.info}>
            {canLevel && <p>You can level up by answering now!</p>}
            <p>Hidden Until: {htmlDate(userQuizInfo.hiddenUntil)}</p>
            <p>Level: {userQuizInfo.level}</p>
            <p>
                {
                    // If date is epoch, then the quiz has never been answered
                    userQuizInfo?.lastCorrect?.toString() === new Date(0).toString()
                        ? "Never Correctly Answered"
                        : `Last Correct Answer: ${htmlDate(
                              userQuizInfo.lastCorrect,
                          )}`
                }
            </p>
        </div>
    );
}
