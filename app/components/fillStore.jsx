"use client";
import { useStore, stores } from "@/store/store";

export function FillStore({
    sourceStore,
    noteStore,
    quizStore,
    groupStore,
    userStore,
}) {
    // const addSources = useStore((state) => state.addSources);
    // const addNotes = useStore((state) => state.addNotes);
    // const addQuizzes = useStore((state) => state.addQuizzes);
    // const addGroups = useStore((state) => state.addGroups);
    // const addUsers = useStore((state) => state.addUsers);
    const addResources = useStore((state) => state.addResources);

    // if (sourceStore?.length > 0) addSources(...sourceStore);
    if (sourceStore?.length > 0) addResources(stores.source, ...sourceStore);
    // if (noteStore?.length > 0) addNotes(...noteStore);
    if (noteStore?.length > 0) addResources(stores.note, ...noteStore);
    if (quizStore?.length > 0) addResources(stores.quiz, ...quizStore);
    if (groupStore?.length > 0) addResources(stores.group, ...groupStore);
    if (userStore?.length > 0) addResources(stores.user, ...userStore);
}
