"use client";

import { Verbatim } from "./Verbatim";
import { useStore, useAlerts } from "@/store/store";
import { useState, useEffect } from "react";
import {
  MultipleChoiceCard,
  CardCreatedAt,
  ResponseCard,
  ListAnswer,
  Blankable,
  CardChip,
  Card,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Dialog,
  DialogContent,
  DialogHeading,
  DialogDescription,
  Form,
  FormButtons,
  InfoBox,
  QuizInput,
  Spinner,
} from "@client";
import styles from "@/app/components/Card/Card.module.css";
import { useRouter } from "next/navigation";
import { toUTCdatestring } from "@/lib/date";
import checkAnswers from "@/lib/checkAnswers";
import listPrint from "@/lib/listPrint";
import { correctConfetti } from "@/lib/correctConfetti";

export function QuizDisplay({
  quiz,
  canClientCheck,
  isFlashcard,
  canEditDelete,
  lighter,
  handleWhenCorrect,
  handleWhenIncorrect,
}) {
  const [answers, setAnswers] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [incIndexes, setIncIndexes] = useState([]);
  const [spelling, setSpelling] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [failures, setFailures] = useState(0);
  const [practice, setPractice] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [clientCheck, setClientCheck] = useState(!!canClientCheck);
  const [flashcard, setFlashcard] = useState(!!isFlashcard);
  const [reveal, setReveal] = useState(false);
  const [hints, setHints] = useState([]);

  useEffect(() => {
    if (!hasAnswered || isFlashcard) return;

    setFlashcard(true);
    setClientCheck(true);
    setTimeout(() => {
      setFlashcard(false);
      setClientCheck(false);
      setIsCorrect(false);
      setAnswers([]);
      setHasAnswered(false);
      setFailures(0);
      setIncIndexes([]);
      setReveal(false);
      addAlert({
        success: true,
        message: `A quiz is ready for you to try again`,
      });
    }, 30000);
  }, [practice]);

  if (!quiz || !quiz.id) return null;

  const user = useStore((state) => state.user);
  const showConfetti =
    (user && user.settings && user.settings.showConfetti) ?? true;
  const storeQuiz = useStore((state) =>
    state.quizzes.find((x) => x.id === quiz.id)
  );
  const addAlert = useAlerts((state) => state.addAlert);
  const router = useRouter();

  const canEdit =
    !!user &&
    quiz.creator &&
    (quiz.creator.id ||
      quiz.permissions.write.includes(user?.id) ||
      quiz.permissions.allWrite);

  const canDelete = quiz.creator && quiz.creator.id === user?.id;

  const whenLevelUp = new Date(toUTCdatestring(quiz.hiddenUntil));
  const canLevelUp = whenLevelUp < Date.now();

  async function handleSubmitAnswer(e) {
    e.preventDefault();

    if ((hasAnswered || !answers) && !flashcard) return;

    setLoading(true);

    if (clientCheck) {
      const ansCheck = checkAnswers({
        userAnswers: answers,
        quiz,
      });

      setReveal(true);

      if (!ansCheck.isCorrect) {
        setFailures((prev) => prev + 1);
        setIsCorrect(false);
        setIncIndexes(ansCheck.incorrectIndexes);
        setHasAnswered(true);

        const showHints = failures >= 2;

        if (showHints) {
          setHints(quiz.hints);
        }

        if (handleWhenIncorrect & !flashcard) handleWhenIncorrect();

        return setLoading(false);
      }

      setHints([]);
      setIsCorrect(true);
      setSpelling(ansCheck.matchQuality);
      setHasAnswered(true);

      if (handleWhenCorrect && !flashcard) handleWhenCorrect();

      if (showConfetti) {
        correctConfetti();
      }

      return setLoading(false);
    } else {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/quiz/${quiz.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ answers: answers }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to check answer");
        } else {
          const data = await response.json();
          if (!data?.content) throw new Error("No data returned");

          const { isCorrect, incorrectIndexes, hints, matchQuality } =
            data.content;

          setIsCorrect(isCorrect);
          setIncIndexes(incorrectIndexes);
          setSpelling(matchQuality);
          setHasAnswered(true);
          setHints(hints);

          if (!isCorrect) {
            if (handleWhenIncorrect & !flashcard) handleWhenIncorrect();
            if (failures >= 2) {
              addAlert({
                success: false,
                message:
                  "You seem to be having trouble. Practice as a flashcard for 30 seconds.",
              });
              setPractice((prev) => !prev);
            } else {
              setFailures((prev) => prev + 1);
            }
          } else {
            setHints([]);

            if (handleWhenCorrect) handleWhenCorrect();

            if (showConfetti) {
              correctConfetti();
            }
          }
        }
      } catch (error) {
        setHasAnswered(false);
        addAlert({
          success: false,
          message: error.message,
        });
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <Card fullWidth lighter={lighter} border={isCorrect && "var(--success)"}>
      <header>
        <h4>
          {quiz.type !== "fill-in-the-blank"
            ? `${quiz.prompt} ${flashcard ? "(Flashcard)" : ""}`
            : "Fill in the blank"}
        </h4>

        <CardChip>Level {storeQuiz?.level}</CardChip>
      </header>

      <Form
        singleColumn
        gap={
          quiz.type === "ordered-list-answer" ||
          quiz.type === "unordered-list-answer" ||
          quiz.type === "unordered-list"
            ? 20
            : 40
        }
        onSubmit={handleSubmitAnswer}
      >
        {quiz.type === "prompt-response" && (
          <ResponseCard
            answers={answers}
            setAnswers={setAnswers}
            hasAnswered={hasAnswered}
            setHasAnswered={setHasAnswered}
            isCorrect={isCorrect}
            lighter={lighter}
          />
        )}

        {quiz.type === "multiple-choice" && (
          <MultipleChoiceCard
            quiz={quiz}
            answers={answers}
            setAnswers={setAnswers}
            hasAnswered={hasAnswered}
            setHasAnswered={setHasAnswered}
            isCorrect={isCorrect}
            lighter={lighter}
          />
        )}

        {[
          "unordered-list-answer",
          "ordered-list-answer",
          "unordered-list",
        ].includes(quiz.type) && (
          <ListAnswer
            quiz={quiz}
            answers={answers}
            setAnswers={setAnswers}
            hasAnswered={hasAnswered}
            setHasAnswered={setHasAnswered}
            incorrectIndexes={incIndexes}
            setIncorrectIndexes={setIncIndexes}
            lighter={lighter}
          />
        )}

        {quiz.type === "fill-in-the-blank" && (
          <Blankable
            quiz={quiz}
            answers={answers}
            setAnswers={setAnswers}
            hasAnswered={hasAnswered}
            setHasAnswered={setHasAnswered}
            incorrectIndexes={incIndexes}
            setIncorrectIndexes={setIncIndexes}
            lighter={lighter}
          />
        )}

        {quiz.type === "verbatim" && (
          <Verbatim
            quiz={quiz}
            answers={answers}
            setAnswers={setAnswers}
            hasAnswered={hasAnswered}
            setHasAnswered={setHasAnswered}
            incorrectIndexes={incIndexes}
            setIncorrectIndexes={setIncIndexes}
            lighter={lighter}
          />
        )}

        {flashcard && reveal && (
          <InfoBox fullWidth asDiv>
            <h4>The correct answer is:</h4>
            {listPrint(quiz.answers, quiz.multipleAnswers ? "and" : "or")}
          </InfoBox>
        )}

        {isCorrect && spelling !== 1 && (
          <InfoBox fullWidth asDiv>
            <h4>
              Your spelling is {Math.round(spelling * 10000) / 100}% correct!
              The exact answer is:
            </h4>
            {listPrint(quiz.answers, quiz.multipleAnswers ? "and" : "or")}
          </InfoBox>
        )}

        {!!hints.length && (
          <InfoBox fullWidth asDiv>
            <h4>Here are some hints to help you out</h4>
            <ul className={styles.hints}>
              {hints.map((hint) => (
                <li key={nanoid()}>{hint}</li>
              ))}
            </ul>
          </InfoBox>
        )}

        <FormButtons>
          {!flashcard && (
            <button
              type="submit"
              disabled={
                (hasAnswered && !isCorrect) || !answers || loading || isCorrect
              }
              className={`button small ${hasAnswered ? (isCorrect ? "success" : "danger") : "primary"}`}
            >
              {isCorrect
                ? "Correct!"
                : hasAnswered
                  ? "Incorrect"
                  : "Check Answer "}{" "}
              {loading && <Spinner primary size={14} margin={2} />}
            </button>
          )}

          {flashcard && (
            <button type="submit" className={`button small primary`}>
              Reveal Answer
            </button>
          )}

          {hasAnswered && isCorrect && (
            <button
              type="button"
              className="button small border"
              onClick={() => {
                setAnswers([]);
                setIsCorrect(false);
                setHasAnswered(false);
              }}
            >
              Try Again
            </button>
          )}
        </FormButtons>
      </Form>

      <div>
        {canLevelUp
          ? "Level Up Now!"
          : "Available to level up " +
            whenLevelUp.toLocaleDateString() +
            " " +
            whenLevelUp.toLocaleTimeString()}
      </div>

      {!!canEditDelete && (!!canEdit || !!canDelete) && (
        <div className={styles.tools}>
          {!!canEdit && (
            <Tooltip>
              <TooltipTrigger>
                <button
                  className={styles.edit}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditOpen((prev) => !prev);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    height="20"
                    width="20"
                  >
                    <path d="M22.987,5.452c-.028-.177-.312-1.767-1.464-2.928-1.157-1.132-2.753-1.412-2.931-1.44-.237-.039-.479,.011-.682,.137-.071,.044-1.114,.697-3.173,2.438,1.059,.374,2.428,1.023,3.538,2.109,1.114,1.09,1.78,2.431,2.162,3.471,1.72-2.01,2.367-3.028,2.41-3.098,.128-.205,.178-.45,.14-.689Z" />
                    <path d="M12.95,5.223c-1.073,.968-2.322,2.144-3.752,3.564C3.135,14.807,1.545,17.214,1.48,17.313c-.091,.14-.146,.301-.159,.467l-.319,4.071c-.022,.292,.083,.578,.29,.785,.188,.188,.443,.293,.708,.293,.025,0,.051,0,.077-.003l4.101-.316c.165-.013,.324-.066,.463-.155,.1-.064,2.523-1.643,8.585-7.662,1.462-1.452,2.668-2.716,3.655-3.797-.151-.649-.678-2.501-2.005-3.798-1.346-1.317-3.283-1.833-3.927-1.975Z" />
                  </svg>
                </button>
              </TooltipTrigger>

              <TooltipContent>Edit Quiz</TooltipContent>
            </Tooltip>
          )}

          {!!canDelete && (
            <Tooltip>
              <TooltipTrigger>
                <button
                  className={styles.delete}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteOpen((prev) => !prev);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    height="20"
                    width="20"
                  >
                    <path d="m17,4v-2c0-1.103-.897-2-2-2h-6c-1.103,0-2,.897-2,2v2H1v2h1.644l1.703,15.331c.169,1.521,1.451,2.669,2.982,2.669h9.304c1.531,0,2.813-1.147,2.981-2.669l1.703-15.331h1.682v-2h-6Zm-8-2h6v2h-6v-2Zm6.957,14.543l-1.414,1.414-2.543-2.543-2.543,2.543-1.414-1.414,2.543-2.543-2.543-2.543,1.414-1.414,2.543,2.543,2.543-2.543,1.414,1.414-2.543,2.543,2.543,2.543Z" />
                  </svg>
                </button>
              </TooltipTrigger>

              <TooltipContent>Delete Quiz</TooltipContent>
            </Tooltip>
          )}

          {!!canEdit && !!editOpen && (
            <Dialog open={true} onOpenChange={() => setEditOpen(false)}>
              <DialogContent>
                <DialogHeading>Edit Quiz</DialogHeading>

                <QuizInput
                  quiz={quiz}
                  close={() => {
                    setEditOpen(false);
                    router.refresh();
                  }}
                />
              </DialogContent>
            </Dialog>
          )}

          {!!canDelete && !!deleteOpen && (
            <Dialog open={true} onOpenChange={() => setDeleteOpen(false)}>
              <DialogContent>
                <DialogHeading>Delete Quiz</DialogHeading>

                <DialogDescription>
                  Are you sure you want to delete this quiz question?
                </DialogDescription>

                <InfoBox type="warning">
                  Deleting this quiz question will remove it from any courses it
                  is associated with.
                </InfoBox>

                <DialogDescription />

                <button
                  className="button danger"
                  onClick={async () => {
                    const response = await fetch(
                      `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/quiz/${quiz ? `/${quiz.id}` : ""}`,
                      {
                        method: "DELETE",
                      }
                    );

                    let data = null;
                    try {
                      data = await response.json();
                    } catch (e) {
                      console.error(`Error parsing response: ${e}`);
                    }

                    if (response.status === 200) {
                      addAlert({
                        success: true,
                        message: data.message || "Successfully deleted quiz",
                      });
                    } else if (response.status === 403) {
                      addAlert({
                        success: false,
                        message:
                          data.message ||
                          "You do not have permission to delete this quiz",
                      });
                    }
                  }}
                >
                  Yes, I want to delete this quiz question
                </button>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
      <footer>
        <p
          title={`Created By ${quiz.creator ? quiz.creator.username : "No one"}`}
        >
          Created By {quiz.creator ? quiz.creator.username : "No one"}
        </p>
        <CardCreatedAt>
          {new Date(quiz.createdAt).toLocaleDateString()}
        </CardCreatedAt>
      </footer>
    </Card>
  );
}
