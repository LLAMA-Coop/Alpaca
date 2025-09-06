import { stringCompare } from "./stringCompare";
import whichIndexesIncorrect from "./whichIndexesIncorrect";

export default function checkAnswers({ userAnswers, quiz }) {
  const { type, answers } = quiz;
  // To reconcile when userAnswers is not an array, uAns always is
  const uAns = Array.isArray(userAnswers) ? userAnswers : [userAnswers];
  // Three useful return values:
  // If correct enough, which index is wrong, and how correct (exact spelling or close enough)
  let isCorrect,
    incorrectIndexes = [],
    matchQuality;

  if (type === "true-false") {
    isCorrect = answers[0] === uAns[0];
  }

  if (type === "prompt-response") {
    isCorrect = answers.some((x) => {
      const compare = stringCompare(x, uAns[0]);
      if (compare >= 0.8) {
        matchQuality = compare;
        return true;
      }
      return false;
    });
  }

  if (type === "multiple-choice") {
    isCorrect = answers.every(
      (a) => uAns.includes(a) && uAns.length === answers.length
    );
  }

  if (
    type ===
    [
      "ordered-list-answer",
      "unordered-list-answer",
      "fill-in-the-blank",
      "verbatim",
    ].includes(type)
  ) {
    incorrectIndexes = whichIndexesIncorrect(
      uAns,
      answers,
      type !== "unordered=list-answer"
    );

    isCorrect = incorrectIndexes.length === 0;
  }

  if (isCorrect === undefined) {
    throw Error(`The quiz type ${type} is invalid`);
  }

  return { isCorrect, incorrectIndexes, matchQuality };
}
