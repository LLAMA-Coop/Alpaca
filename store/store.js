import { create } from "zustand";
// import { useUser, queryReadableResources } from "@/lib/auth";
// import { Source, Note, Quiz } from "@mneme_app/database-models";

// const user = useUser();
// const query = queryReadableResources(user);
// const sourceStore = await Source.find(query);
// const noteStore = await Note.find(query);
// const quizStore = await Quiz.find(query);

const fillNewStore = (resource, newStore) => {
    const alreadyStored = newStore.find((x) => x._id === resource._id);
    if (!alreadyStored) {
        newStore.push(resource);
    }
};

export const useStore = create((set) => ({
    sourceStore: [],
    noteStore: [],
    quizStore: [],
    groupStore: [],
    userStore: [],

    addSources: (...sources) =>
        set((state) => {
            const newStore = [...state.sourceStore];
            sources.forEach((source) => fillNewStore(source, newStore));
            return {
                sourceStore: newStore,
            };
        }),

    addNotes: (...notes) =>
        set((state) => {
            const newStore = [...state.noteStore];
            notes.forEach((note) => fillNewStore(note, newStore));
            return {
                noteStore: newStore,
            };
        }),

    addQuizzes: (...quizzes) =>
        set((state) => {
            const newStore = [...state.quizStore];
            quizzes.forEach((quiz) => fillNewStore(quiz, newStore));
            return {
                quizStore: newStore,
            };
        }),

    addUsers: (...users) =>
        set((state) => {
            const newStore = [...state.userStore];
            users.forEach((user) => fillNewStore(user, newStore));
            return {
                userStore: newStore,
            };
        }),

    addGroups: (...groups) =>
        set((state) => {
            const newStore = [...state.groupStore];
            groups.forEach((group) => fillNewStore(group, newStore));
            return {
                groupStore: newStore,
            };
        }),
}));
