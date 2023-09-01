"use client";
import { useStore } from "@/store/store";

export function FillStore({ sourceStore, noteStore, quizStore }) {
    const addSources = useStore((state) => state.addSources);
    const addNotes = useStore((state) => state.addNotes);
    const addQuizzes = useStore((state) => state.addQuizzes);

    if (sourceStore?.length > 0) addSources(...sourceStore);
    if (noteStore?.length > 0) addNotes(...noteStore);
    if (quizStore?.length > 0) addQuizzes(...quizStore);
}
