import stringCompare from "@/lib/stringCompare";

export default function whichIndexesIncorrect(
    userResponseList,
    correctResponseList,
    isOrdered = true,
) {
    const incorrectIndexes = [];

    if (isOrdered) {
        correctResponseList.forEach((correct, index) => {
            if (Array.isArray(correct)) {
                const included = correct.find(
                    (x) => stringCompare(x, userResponseList[index]) >= 0.8,
                );
                if (included === undefined) {
                    incorrectIndexes.push(index);
                    return;
                }
            }
            if (
                !Array.isArray(correct) &&
                stringCompare(correct, userResponseList[index]) < 0.8
            ) {
                incorrectIndexes.push(index);
            }
        });

        if (userResponseList.length > correctResponseList.length) {
            for (
                let i = correctResponseList.length;
                i < userResponseList.length;
                i++
            ) {
                incorrectIndexes.push(i);
            }
        }

        return incorrectIndexes;
    }

    const correctAvailable = Array(correctResponseList.length).fill(true);
    userResponseList.forEach((res, idx) => {
        let isCorrect = correctResponseList.find((correct, correctIdx) => {
            if (!correctAvailable[correctIdx]) {
                return false;
            }
            if (Array.isArray(correct)) {
                let found = correct.find((c) => stringCompare(c, res) >= 0.8);
                if (found) {
                    correctAvailable[correctIdx] = false;
                    return true;
                }
                return false;
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
