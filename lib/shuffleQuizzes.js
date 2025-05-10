import shuffleArray from "./shuffleArray";

export default function shuffleQuizzes(quizArray) {
    const filtered = quizArray.filter((quiz) => {
        return new Date(quiz.hiddenUntil) <= Date.now();
    });

    return shuffleArray(filtered).sort((quiz1, quiz2) => {
        return quiz1.level - quiz2.level;
    });
}
