"use client";

import { CardChip, CardCreatedAt, CardList, CardListItem } from "../Card/Card";
import styles from "@/app/components/Card/Card.module.css";
import { useRouter } from "next/navigation";
import { useStore, useAlerts } from "@/store/store";
import { useState } from "react";
import {
  DialogDescription,
  TooltipTrigger,
  TooltipContent,
  DialogContent,
  DialogHeading,
  SourceInput,
  Tooltip,
  InfoBox,
  Dialog,
  Card,
} from "@client";

export function SourceDisplay({ source }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  if (!source) return null;

  const user = useStore((state) => state.user);
  const coursesStore = useStore((state) => state.courses);
  const addAlert = useAlerts((state) => state.addAlert);
  const router = useRouter();

  const courses = source.courses
    ? source.courses
        .map((x) => coursesStore.find((crs) => crs.id === x))
        .filter((x) => !!x)
    : [];

  const canEdit =
    !!user &&
    source.creator &&
    (source.creator.id === user?.id ||
      source.permissions.write.includes(user?.id) ||
      source.permissions.allWrite);

  const canDelete = source.creator && source.creator.id === user?.id;

  return (
    <Card fullWidth link={`/sources/${source.publicId}`}>
      <header>
        <h4 title={source.title}>{source.title}</h4>
        <CardChip>{source.medium}</CardChip>
      </header>

      {!!source.tags.length && (
        <section>
          <h5>
            Tags
            <CardChip>{source.tags.length}</CardChip>
          </h5>

          <CardList>
            {source.tags.map((tag) => (
              <CardListItem key={tag}>{tag}</CardListItem>
            ))}
          </CardList>
        </section>
      )}

      {!!source.credits.length && (
        <section>
          <h5>
            Credits
            <CardChip>{source.credits.length}</CardChip>
          </h5>

          <CardList>
            {source.credits.map((credit) => (
              <CardListItem key={credit}>{credit}</CardListItem>
            ))}
          </CardList>
        </section>
      )}

      {!!courses.length && (
        <section>
          <h5>
            Courses
            <CardChip>{courses.length}</CardChip>
          </h5>

          <p>This source has been used in the following courses.</p>

          <CardList>
            {courses.map((c) => (
              <CardListItem key={c.id}>{c.name}</CardListItem>
            ))}
          </CardList>
        </section>
      )}

      {(!!canEdit || !!canDelete) && (
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

              <TooltipContent>Edit Source</TooltipContent>
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

              <TooltipContent>Delete Source</TooltipContent>
            </Tooltip>
          )}

          {!!canEdit && !!editOpen && (
            <Dialog open={true} onOpenChange={() => setEditOpen(false)}>
              <DialogContent>
                <DialogHeading>Edit Source</DialogHeading>

                <SourceInput
                  source={source}
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
                <DialogHeading>Delete Source</DialogHeading>

                <DialogDescription>
                  Are you sure you want to delete this source?
                </DialogDescription>

                <InfoBox type="warning">
                  Deleting this source will remove it from any courses it is
                  associated with.
                </InfoBox>

                <DialogDescription />

                <button
                  className="button danger"
                  onClick={async () => {
                    const response = await fetch(
                      `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/source/${source ? `/${source.id}` : ""}`,
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
                        message: data.message || "Successfully deleted source",
                      });
                    } else if (response.status === 403) {
                      addAlert({
                        success: false,
                        message:
                          data.message ||
                          "You do not have permission to delete this source",
                      });
                    }
                  }}
                >
                  Yes, I want to delete this source
                </button>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}

      <footer>
        {source.creator && <p>Created by {source.creator.username}</p>}
        <CardCreatedAt>
          {new Date(source.createdAt).toLocaleDateString()}
        </CardCreatedAt>
      </footer>
    </Card>
  );
}
