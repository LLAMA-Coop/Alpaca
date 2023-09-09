"use client";
import { useStore, stores } from "@/store/store";
import { useEffect } from "react";

export function FillStore({
    sourceStore,
    noteStore,
    quizStore,
    groupStore,
    userStore,
    webSocketURL
}) {
    const addResources = useStore((state) => state.addResources);
    const isAuthenticated = useStore((state) => state.isAuthenticated);

    useEffect(() => {
        const ws = new WebSocket(webSocketURL);
        // if (!isAuthenticated) {
        //     console.log(
        //         "You are logged out, therefore web socket server is closing",
        //     );
        //     ws.close();
        //     return;
        // }
        ws.onopen = () => {
            console.log("Connection open!");
        };

        ws.onmessage = (message) => {
            const record = JSON.parse(message.data);
            console.log(record);

            if (!record.ns) return;
        };

        return () => {
            ws.close();
            console.log("Web socket connection closed");
        };
    }, []);

    if (sourceStore?.length > 0) addResources(stores.source, ...sourceStore);
    if (noteStore?.length > 0) addResources(stores.note, ...noteStore);
    if (quizStore?.length > 0) addResources(stores.quiz, ...quizStore);
    if (groupStore?.length > 0) addResources(stores.group, ...groupStore);
    if (userStore?.length > 0) addResources(stores.user, ...userStore);
}
