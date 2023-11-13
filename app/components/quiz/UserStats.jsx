import styles from "./UserStats.module.css";
import htmlDate from "@/lib/htmlDate";

export function UserStats({ userQuizInfo }) {
    return (
        <div className={styles.info}>
            <p>Hidden Until: {htmlDate(userQuizInfo.hiddenUntil)}</p>
            <p>Level: {userQuizInfo.level}</p>
            <p>
                {
                    // If date is epoch, then the quiz has never been answered
                    userQuizInfo.lastCorrect === new Date(0)
                        ? "Never Correctly Answered"
                        : `Last Correct Answer: ${htmlDate(
                              userQuizInfo.lastCorrect,
                          )}`
                }
            </p>
        </div>
    );
}
