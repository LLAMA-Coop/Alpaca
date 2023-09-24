"use client";
import { useStore, stores } from "@/store/store";
import { useEffect } from "react";

export function FillStore({
    sourceStore,
    noteStore,
    quizStore,
    groupStore,
    userStore,
    webSocketURL,
    user,
    notifications,
}) {
    const addResources = useStore((state) => state.addResources);
    const updateResource = useStore((state) => state.updateResource);
    const setUser = useStore((state) => state.setUser);
    const addNotifications = useStore((state) => state.addNotifications);

    useEffect(() => {
        const ws = new WebSocket(webSocketURL);
        ws.onopen = () => {
            console.log("Connection open!");
        };

        ws.onmessage = (message) => {
            const record = JSON.parse(message.data);
            console.log(record);

            if (!record.ns) return;
            const operation = record.operationType;
            const collection = record.ns.coll;
            const resource = record.fullDocument;
            let storeName;
            if (collection === "sources") {
                storeName = stores.source;
            }
            if (collection === "notes") {
                storeName = stores.note;
            }
            if (collection === "quizzes") {
                storeName = stores.quiz;
            }

            if (operation === "insert") {
                addResources(storeName, resource);
            }
            if (operation === "update") {
                updateResource(storeName, resource);
            }

            console.log("we are doing this:", operation, resource, storeName);
        };

        if (sourceStore?.length > 0) addResources(stores.source, ...sourceStore);
        if (noteStore?.length > 0) addResources(stores.note, ...noteStore);
        if (quizStore?.length > 0) addResources(stores.quiz, ...quizStore);
        if (groupStore?.length > 0) addResources(stores.group, ...groupStore);
        if (userStore?.length > 0) addResources(stores.user, ...userStore);
        if (user) setUser(user);
        if (notifications) addNotifications(...notifications);

        return () => {
            ws.close();
            console.log("Web socket connection closed");
        };
    }, []);
}
