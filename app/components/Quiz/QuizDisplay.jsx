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
  InfoBox,
  QuizInput,
} from "@client";
import styles from "@/app/components/Card/Card.module.css";
import { useRouter } from "next/navigation";
import { toUTCdatestring } from "@/lib/date";

export function QuizDisplay({
  quiz,
  canClientCheck,
  isFlashcard,
  canEditDelete,
  lighter,
  handleWhenCorrect,
}) {
  const [correct, setCorrect] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  if (!quiz || !quiz.id) return null;

  const user = useStore((state) => state.user);
  const storeQuiz = useStore((state) =>
    state.quizzes.find((x) => x.id === quiz.id)
  );
  const addAlert = useAlerts((state) => state.addAlert);
  const router = useRouter();

  useEffect(() => {
    console.log("It changed!!!", storeQuiz)
  }, [storeQuiz])

  const canEdit =
    !!user &&
    quiz.creator &&
    (quiz.creator.id ||
      quiz.permissions.write.includes(user?.id) ||
      quiz.permissions.allWrite);

  const canDelete = quiz.creator && quiz.creator.id === user?.id;

  const whenLevelUp = new Date(toUTCdatestring(quiz.hiddenUntil));
  const canLevelUp = whenLevelUp < Date.now();

  return (
    <Card fullWidth lighter={lighter} border={correct && "var(--success)"}>
      <header>
        <h4>
          {quiz.type !== "fill-in-the-blank"
            ? `${quiz.prompt} ${isFlashcard ? "(Flashcard)" : ""}`
            : "Fill in the blank"}
        </h4>

        <CardChip>Level {storeQuiz?.level}</CardChip>
      </header>

      {(() => {
        if (quiz.type === "prompt-response") {
          return (
            <ResponseCard
              quiz={quiz}
              lighter={lighter}
              setCorrect={setCorrect}
              canClientCheck={canClientCheck}
              isFlashcard={isFlashcard}
              handleWhenCorrect={handleWhenCorrect}
            />
          );
        }

        if (quiz.type === "multiple-choice") {
          return (
            <MultipleChoiceCard
              quiz={quiz}
              lighter={lighter}
              setCorrect={setCorrect}
              canClientCheck={canClientCheck}
              isFlashcard={isFlashcard}
              handleWhenCorrect={handleWhenCorrect}
            />
          );
        }

        if (
          [
            "unordered-list-answer",
            "ordered-list-answer",
            "unordered-list",
          ].includes(quiz.type)
        ) {
          return (
            <ListAnswer
              quiz={quiz}
              lighter={lighter}
              setCorrect={setCorrect}
              canClientCheck={canClientCheck}
              isFlashcard={isFlashcard}
              handleWhenCorrect={handleWhenCorrect}
            />
          );
        }

        if (quiz.type === "fill-in-the-blank") {
          return (
            <Blankable
              quiz={quiz}
              lighter={lighter}
              setCorrect={setCorrect}
              canClientCheck={canClientCheck}
              isFlashcard={isFlashcard}
              handleWhenCorrect={handleWhenCorrect}
            />
          );
        }

        if (quiz.type === "verbatim") {
          return (
            <Verbatim
              quiz={quiz}
              lighter={lighter}
              setCorrect={setCorrect}
              canClientCheck={canClientCheck}
              isFlashcard={isFlashcard}
              handleWhenCorrect={handleWhenCorrect}
            />
          );
        }
      })()}

      {!!canEditDelete && (
        <div>
          {canLevelUp
            ? "Level Up Now!"
            : "Available to level up " +
              whenLevelUp.toLocaleDateString() +
              " " +
              whenLevelUp.toLocaleTimeString()}
        </div>
      )}

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
