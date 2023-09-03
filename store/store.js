import { create } from "zustand";

const addResources = (state, storeName, ...resources) => {
    if (!Object.values(stores).includes(storeName)) {
        throw Error(`We do not have a list called ${storeName}`);
    }
    const newStore = [...state[storeName]];
    resources.forEach((resource) => {
        const alreadyStored = newStore.find((x) => x._id === resource._id);
        if (!alreadyStored && resource._id) {
            newStore.push(resource);
        } else if(!resource._id){
            console.error("Missing _id property", resource);
        }
    });
    const newState = {};
    newState[storeName] = newStore;
    return newState;
};

// const fillNewStore = (resource, newStore) => {
//     const alreadyStored = newStore.find((x) => x._id === resource._id);
//     if (!alreadyStored) {
//         newStore.push(resource);
//     }
// };

//needs testing
const updateResource = (state, storeName, newResource) => {
    if (!Object.values(stores).includes(storeName)) {
        throw Error(`We do not have a list called ${storeName}`);
    }
    if (!newResource || !newResource._id) {
        throw Error(`This resource does not have an _id key`);
    }
    const newStore = [...state[storeName]];
    const oldResource = newStore.find((x) => x._id === newResource._id);
    if (oldResource) {
        const index = newStore.indexOf(oldResource);
        newStore.splice(index, 1, newResource);
    } else {
        newStore.push(newResource);
    }
    const newState = {};
    newState[storeName] = newStore;
};

export const stores = {
    source: "sourceStore",
    note: "noteStore",
    quiz: "quizStore",
    group: "groupStore",
    user: "userStore",
};

export const useStore = create((set) => ({
    sourceStore: [],
    noteStore: [],
    quizStore: [],
    groupStore: [],
    userStore: [],

    addResources: (storeName, ...resources) => {
        try {
            console.log("new resources", resources);
            return set((state) => addResources(state, storeName, ...resources));
        } catch (e) {
            console.error(e);
        }
    },

    updateResource: (storeName, newResource) => {
        try {
            console.log("resource to update", newResource);
            return set((state) =>
                updateResource(state, storeName, newResource),
            );
        } catch (e) {
            console.error(e);
        }
    },

    // addSources: (...sources) =>
    //     set((state) => {
    //         const newStore = [...state.sourceStore];
    //         sources.forEach((source) => fillNewStore(source, newStore));
    //         return {
    //             sourceStore: newStore,
    //         };
    //     }),

    // addNotes: (...notes) =>
    //     set((state) => {
    //         const newStore = [...state.noteStore];
    //         notes.forEach((note) => fillNewStore(note, newStore));
    //         return {
    //             noteStore: newStore,
    //         };
    //     }),

    // addQuizzes: (...quizzes) =>
    //     set((state) => {
    //         const newStore = [...state.quizStore];
    //         quizzes.forEach((quiz) => fillNewStore(quiz, newStore));
    //         return {
    //             quizStore: newStore,
    //         };
    //     }),

    // addUsers: (...users) =>
    //     set((state) => {
    //         const newStore = [...state.userStore];
    //         users.forEach((user) => fillNewStore(user, newStore));
    //         return {
    //             userStore: newStore,
    //         };
    //     }),

    // addGroups: (...groups) =>
    //     set((state) => {
    //         const newStore = [...state.groupStore];
    //         groups.forEach((group) => fillNewStore(group, newStore));
    //         return {
    //             groupStore: newStore,
    //         };
    //     }),
}));
