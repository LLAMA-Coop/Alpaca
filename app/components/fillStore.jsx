"use client";
import { useStore } from "@/store/store";

export function FillStore({
    sourceStore,
    noteStore,
    quizStore,
    groupStore,
    userStore,
}) {
    const addSources = useStore((state) => state.addSources);
    const addNotes = useStore((state) => state.addNotes);
    const addQuizzes = useStore((state) => state.addQuizzes);
    const addGroups = useStore((state) => state.addGroups);
    const addUsers = useStore((state) => state.addUsers);

    if (sourceStore?.length > 0) addSources(...sourceStore);
    if (noteStore?.length > 0) addNotes(...noteStore);
    if (quizStore?.length > 0) addQuizzes(...quizStore);
    if (groupStore?.length > 0) addGroups(...groupStore);
    if (userStore?.length > 0) addUsers(...userStore);
}
