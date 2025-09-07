import { stringCompare } from "./stringCompare";

export default function whichIndexesIncorrect(
  userAnswers,
  answers,
  isOrdered = true,
  options
) {
  const incorrectIndexes = [];

  if (isOrdered) {
    answers.forEach((correct, index) => {
      if (Array.isArray(correct)) {
        const included = correct.find((x) => {
          const match = stringCompare(x, userAnswers[index]);
          if (
            options.matchQuality === undefined ||
            match < options.matchQuality
          )
            options.matchQuality = match;
          return match >= 0.8;
        });

        if (included === undefined) {
          return incorrectIndexes.push(index);
        }
      } else {
        const match = stringCompare(correct, userAnswers[index]);
        if (options.matchQuality === undefined || match < options.matchQuality)
          options.matchQuality = match;
        if (match < 0.8) incorrectIndexes.push(index);
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
        let found = correct.find((c) => {
          const match = stringCompare(c, res);
          if (match >= 0.8) {
            if (
              options.matchQuality === undefined ||
              match < options.matchQuality
            )
              options.matchQuality = match;

            return true;
          }
        });

        if (found) {
          correctAvailable[correctIdx] = false;
        }

        return !!found;
      }

      const match = stringCompare(correct, res);

      if (match >= 0.8) {
        correctAvailable[correctIdx] = false;
        if (options.matchQuality === undefined || match < options.matchQuality)
          options.matchQuality = match;
        return true;
      }
    });

    if (isCorrect === undefined) {
      incorrectIndexes.push(idx);
    }
  });

  return incorrectIndexes;
}
