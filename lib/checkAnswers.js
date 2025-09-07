import { stringCompare } from "./stringCompare";
import whichIndexesIncorrect from "./whichIndexesIncorrect";

export default function checkAnswers({ userAnswers, quiz }) {
  const { type, answers } = quiz;
  // To reconcile when userAnswers is not an array, uAns always is
  const uAns = Array.isArray(userAnswers) ? userAnswers : [userAnswers];
  // Three useful return values:
  // If correct enough, which index is wrong, and how correct (exact spelling or close enough)
  const ansVal = {
    isCorrect: undefined,
    incorrectIndexes: [],
    matchQuality: undefined,
  };

  if (type === "true-false") {
    ansVal.isCorrect = answers[0] === uAns[0];
    ansVal.matchQuality = ansVal.isCorrect ? 1 : 0;
  }

  if (type === "prompt-response") {
    ansVal.isCorrect = answers.some((x) => {
      ansVal.matchQuality = stringCompare(x, uAns[0]);
      if (ansVal.matchQuality >= 0.8) {
        return true;
      }
      return false;
    });
  }

  if (type === "multiple-choice") {
    ansVal.isCorrect = answers.every(
      (a) => uAns.includes(a) && uAns.length === answers.length
    );
    ansVal.matchQuality = ansVal.isCorrect ? 1 : 0;
  }

  if (
    [
      "ordered-list-answer",
      "unordered-list-answer",
      "fill-in-the-blank",
      "verbatim",
    ].includes(type)
  ) {
    ansVal.incorrectIndexes = whichIndexesIncorrect(
      uAns,
      answers,
      type !== "unordered-list-answer",
      ansVal
    );

    ansVal.isCorrect = ansVal.incorrectIndexes.length === 0;
  }

  if (ansVal.isCorrect === undefined) {
    throw Error(`The quiz type ${type} is invalid`);
  }

  return ansVal;
}
