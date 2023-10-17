import htmlDate from "@/lib/htmlDate";

export function UserStats({ userQuizInfo }) {
    return (
        <>
            <p>Hidden Until: {htmlDate(userQuizInfo.hiddenUntil)}</p>
            <p>Level: {userQuizInfo.level}</p>
            <p>Last Time Answered Correctly: {htmlDate(userQuizInfo.lastCorrect)}</p>
        </>
    );
}
