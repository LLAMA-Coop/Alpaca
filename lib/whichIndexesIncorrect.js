import { stringCompare } from "./stringCompare";

export default function whichIndexesIncorrect(userAnswers, answers, isOrdered = true) {
    const incorrectIndexes = [];

    if (isOrdered) {
        answers.forEach((correct, index) => {
            if (Array.isArray(correct)) {
                const included = correct.find((x) => stringCompare(x, userAnswers[index]) >= 0.8);

                if (included === undefined) {
                    return incorrectIndexes.push(index);
                }
            } else if (stringCompare(correct, userAnswers[index]) < 0.8) {
                incorrectIndexes.push(index);
            }
        });

        if (userAnswers.length > answers.length) {
            for (let i = answers.length; i < userAnswers.length; i++) {
                incorrectIndexes.push(i);
            }
        }

        return incorrectIndexes;
    }

    const correctAvailable = Array(answers.length).fill(true);

    userAnswers.forEach((res, idx) => {
        let isCorrect = answers.find((correct, correctIdx) => {
            if (!correctAvailable[correctIdx]) {
                return false;
            }

            if (Array.isArray(correct)) {
                let found = correct.find((c) => stringCompare(c, res) >= 0.8);

                if (found) {
                    correctAvailable[correctIdx] = false;
                }

                return !!found;
            }

            if (stringCompare(correct, res) >= 0.8) {
                correctAvailable[correctIdx] = false;
                return true;
            }
        });

        if (isCorrect === undefined) {
            incorrectIndexes.push(idx);
        }
    });

    return incorrectIndexes;
}
