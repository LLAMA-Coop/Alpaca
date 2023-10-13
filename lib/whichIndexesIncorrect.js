// LATER bring in spelling mercies

export default function whichIndexesIncorrect(
    userResponseList,
    correctResponseList,
    isOrdered = true,
) {
    const incorrectIndexes = [];
    const correctComparison = correctResponseList.map((x) => {
        if (Array.isArray(x)) {
            return x.map((y) => (typeof y === "string" ? y.toLowerCase() : y));
        }
        return typeof x === "string" ? x.toLowerCase() : x;
    });
    const responseComparison = userResponseList.map((x) =>
        typeof x === "string" ? x.toLowerCase() : x,
    );

    if (isOrdered) {
        correctComparison.forEach((correct, index) => {
            if (
                Array.isArray(correct) &&
                !correct.includes(responseComparison[index])
            ) {
                incorrectIndexes.push(index);
                return;
            }
            if (
                !Array.isArray(correct) &&
                correct !== responseComparison[index]
            ) {
                incorrectIndexes.push(index);
            }
        });

        if (responseComparison.length > correctComparison.length) {
            for (
                let i = correctComparison.length;
                i < responseComparison.length;
                i++
            ) {
                incorrectIndexes.push(i);
            }
        }

        return incorrectIndexes;
    }

    const userResponseSet = new Set(responseComparison);
    if (userResponseSet.size < responseComparison.length) {
        userResponseSet.forEach((x) => {
            let times = 0;
            for (let index = 0; index < responseComparison.length; index++) {
                if (responseComparison[index] === x) {
                    times++;
                    if (times > 1) {
                        incorrectIndexes.push(index);
                    }
                }
            }
        });
    }

    for (const responseItem of correctComparison) {
        if (Array.isArray(responseItem)) {
            let correctItem = responseItem.find((item, idx) => {
                return userResponseSet.has(item);
            });
            if (correctItem) {
                userResponseSet.delete(correctItem);
            } else {
                incorrectIndexes.push(-1);
            }
        } else {
            if (userResponseSet.has(responseItem)) {
                userResponseSet.delete(responseItem);
            }
        }
    }

    userResponseSet.forEach((x) => {
        incorrectIndexes.push(responseComparison.indexOf(x));
    });

    return incorrectIndexes;
}
